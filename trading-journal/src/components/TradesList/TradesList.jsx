import React, { useState, useEffect, useCallback } from 'react';
import { Table, InputGroup, Input, Panel, SelectPicker, TagPicker, Tag, DateRangePicker, IconButton, toaster, Message } from 'rsuite';
import { getTrades, getBuyTransactions, getSellTransactions, getSetups, getTypes, getMarkets, deleteTrade } from '../../api/trades';
import { useAuth } from '../../contexts/AuthContext';
import TrashIcon from '@rsuite/icons/Trash';

const { Column, HeaderCell, Cell } = Table;

// Function to generate a color based on trade ID
const getColorFromId = (id) => {
  const hue = (id * 137.508) % 360; // Use golden angle approximation
  return `hsl(${hue}, 50%, 75%)`; // Lighter pastel colors
};

const ColorDot = ({ tradeId }) => (
  <div
    style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: getColorFromId(tradeId),
      margin: 'auto',
    }}
  />
);

const TradesList = () => {
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [setups, setSetups] = useState([]);
  const [types, setTypes] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [selectedSetups, setSelectedSetups] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState(null);
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTrades();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    filterTrades();
  }, [searchKeyword, selectedSetups, selectedTypes, selectedMarkets, dateFilter, customDateRange, trades]);

  const fetchTrades = useCallback(async () => {
    try {
      const tradesData = await getTrades(user.id);
      const tradesWithTransactions = await Promise.all(
        tradesData.map(async (trade) => {
          const buyTransactions = await getBuyTransactions(trade.id) || [];
          const sellTransactions = await getSellTransactions(trade.id) || [];
          return {
            ...trade,
            buyTransactions,
            sellTransactions,
          };
        })
      );
      setTrades(tradesWithTransactions);
      setFilteredTrades(tradesWithTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trades:', error);
      setLoading(false);
    }
  }, [user.id, getBuyTransactions, getSellTransactions, setTrades, setFilteredTrades, setLoading]);

  const fetchFilterOptions = async () => {
    try {
      const setupsData = await getSetups();
      const typesData = await getTypes();
      const marketsData = await getMarkets();
      setSetups(setupsData.map(setup => ({ label: setup.setup_name, value: setup.id })));
      setTypes(typesData.map(type => ({ label: type.type_name, value: type.id })));
      setMarkets(marketsData.map(market => ({ label: market.market_name, value: market.id })));
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
    const sorted = [...filteredTrades].sort((a, b) => {
      let x = a[sortColumn];
      let y = b[sortColumn];
      if (typeof x === 'string') x = x.toLowerCase();
      if (typeof y === 'string') y = y.toLowerCase();
      if (sortType === 'asc') return x > y ? 1 : -1;
      else return x < y ? 1 : -1;
    });
    setFilteredTrades(sorted);
  };

  const filterTrades = useCallback(() => {
    let filtered = trades.filter((trade) =>
      trade.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    // Apply setup, type, and market filters
    if (selectedSetups.length > 0) {
      filtered = filtered.filter(trade => selectedSetups.includes(trade.setup_id));
    }
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(trade => selectedTypes.includes(trade.type_id));
    }
    if (selectedMarkets.length > 0) {
      filtered = filtered.filter(trade => selectedMarkets.includes(trade.market_id));
    }

    // Apply date filter
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    filtered = filtered.flatMap(trade => {
      const buyRows = (trade.buyTransactions || []).map(transaction => ({
        ...trade,
        ...transaction,
        type: 'Buy'
      }));
      const sellRows = (trade.sellTransactions || []).map(transaction => ({
        ...trade,
        ...transaction,
        type: 'Sell'
      }));
      return buyRows.length > 0 || sellRows.length > 0 ? buyRows.concat(sellRows) : [{...trade, type: 'No Transactions'}];
    }).filter(row => {
      const transactionDate = new Date(row.buy_date || row.sell_date || row.creation_date);
      switch (dateFilter) {
        case 'lastYear':
          return transactionDate >= oneYearAgo;
        case 'ytd':
          return transactionDate >= startOfYear;
        case 'currentMonth':
          return transactionDate >= startOfMonth;
        case 'custom':
          if (customDateRange) {
            return transactionDate >= customDateRange[0] && transactionDate <= customDateRange[1];
          }
          return true;
        default:
          return true;
      }
    });

    setFilteredTrades(filtered);
  }, [trades, searchKeyword, selectedSetups, selectedTypes, selectedMarkets, dateFilter, customDateRange]);

  const TransactionTag = ({ type }) => (
    <Tag color={type === 'Buy' ? 'red' : 'blue'} style={{ marginRight: '5px' }}>
      {type}
    </Tag>
  );

  const dateFilterOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Last Year', value: 'lastYear' },
    { label: 'Year to Date', value: 'ytd' },
    { label: 'Current Month', value: 'currentMonth' },
    { label: 'Custom Range', value: 'custom' },
  ];

  const handleDelete = async (tradeId) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      setIsDeleting(true);
      try {
        await deleteTrade(tradeId);
        // Refresh the trades list after deletion
        await fetchTrades();
        toaster.push(
          <Message type="success" showIcon>
            Trade deleted successfully
          </Message>,
          { placement: 'topCenter' }
        );
      } catch (error) {
        console.error('Error deleting trade:', error);
        toaster.push(
          <Message type="error" showIcon>
            Error deleting trade. Please try again.
          </Message>,
          { placement: 'topCenter' }
        );
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Panel header="Trades List" bordered bodyFill>
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <InputGroup inside style={{ width: '30%' }}>
            <Input
              placeholder="Search by trade name"
              value={searchKeyword}
              onChange={setSearchKeyword}
            />
            <InputGroup.Button>
              <i className="rs-icon rs-icon-search" />
            </InputGroup.Button>
          </InputGroup>
          <SelectPicker 
            data={dateFilterOptions}
            searchable={false}
            style={{ width: 200 }}
            placeholder="Filter by Date"
            value={dateFilter}
            onChange={setDateFilter}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <TagPicker
            data={setups}
            placeholder="Filter by Setup"
            style={{ width: '30%' }}
            onChange={setSelectedSetups}
          />
          <TagPicker
            data={types}
            placeholder="Filter by Type"
            style={{ width: '30%' }}
            onChange={setSelectedTypes}
          />
          <TagPicker
            data={markets}
            placeholder="Filter by Market"
            style={{ width: '30%' }}
            onChange={setSelectedMarkets}
          />
        </div>
        {dateFilter === 'custom' && (
          <DateRangePicker 
            value={customDateRange}
            onChange={setCustomDateRange}
            style={{ width: 280 }}
          />
        )}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <Table
            height={400}
            data={filteredTrades}
            sortColumn={sortColumn}
            sortType={sortType}
            onSortColumn={handleSortColumn}
            loading={loading}
            autoHeight
          >
            <Column width={50} align="center" fixed>
              <HeaderCell>Trade</HeaderCell>
              <Cell>
                {rowData => <ColorDot tradeId={rowData.id} />}
              </Cell>
            </Column>
            <Column width={120} align="center" fixed sortable>
              <HeaderCell>Trade Name</HeaderCell>
              <Cell dataKey="name" />
            </Column>
            <Column width={100} align="center" sortable>
              <HeaderCell>Creation Date</HeaderCell>
              <Cell dataKey="creation_date" />
            </Column>
            <Column width={80} align="center">
              <HeaderCell>Setup</HeaderCell>
              <Cell>
                {rowData => setups.find(s => s.value === rowData.setup_id)?.label || ''}
              </Cell>
            </Column>
            <Column width={80} align="center">
              <HeaderCell>Type</HeaderCell>
              <Cell>
                {rowData => types.find(t => t.value === rowData.type_id)?.label || ''}
              </Cell>
            </Column>
            <Column width={80} align="center">
              <HeaderCell>Market</HeaderCell>
              <Cell>
                {rowData => markets.find(m => m.value === rowData.market_id)?.label || ''}
              </Cell>
            </Column>
            <Column width={60} align="center">
              <HeaderCell>Rank</HeaderCell>
              <Cell dataKey="group_rank" />
            </Column>
            <Column width={60} align="center">
              <HeaderCell>Risk %</HeaderCell>
              <Cell dataKey="risk_percent" />
            </Column>
            <Column width={100} align="center">
              <HeaderCell>Transaction</HeaderCell>
              <Cell>
                {rowData => <TransactionTag type={rowData.type} />}
              </Cell>
            </Column>
            <Column width={100} align="center">
              <HeaderCell>Quantity</HeaderCell>
              <Cell dataKey="quantity" />
            </Column>
            <Column width={100} align="center">
              <HeaderCell>Price</HeaderCell>
              <Cell>
                {rowData => {
                  const price = rowData.buy_price || rowData.sell_price;
                  return price ? `$${price.toFixed(2)}` : '-';
                }}
              </Cell>
            </Column>
            <Column width={120} align="center">
              <HeaderCell>Date</HeaderCell>
              <Cell>
                {rowData => {
                  const date = rowData.buy_date || rowData.sell_date;
                  return date ? new Date(date).toLocaleDateString() : '-';
                }}
              </Cell>
            </Column>
            <Column width={100} align="center">
              <HeaderCell>Brokerage</HeaderCell>
              <Cell>
                {rowData => {
                  const brokerage = rowData.buy_brokerage || rowData.sell_brokerage;
                  return brokerage ? `$${brokerage.toFixed(2)}` : '-';
                }}
              </Cell>
            </Column>
            <Column width={100} align="center">
              <HeaderCell>Initial Stop</HeaderCell>
              <Cell>
                {rowData => rowData.initial_stop ? `$${rowData.initial_stop.toFixed(2)}` : '-'}
              </Cell>
            </Column>
            <Column width={100} align="center">
              <HeaderCell>Stop Loss %</HeaderCell>
              <Cell>
                {rowData => rowData.stop_loss_percent ? `${rowData.stop_loss_percent.toFixed(2)}%` : '-'}
              </Cell>
            </Column>
            <Column width={100} fixed="right">
              <HeaderCell>Actions</HeaderCell>
              <Cell>
                {rowData => (
                  <IconButton
                    icon={<TrashIcon />}
                    size="sm"
                    appearance="subtle"
                    color="red"
                    onClick={() => handleDelete(rowData.id)}
                    disabled={isDeleting}
                  />
                )}
              </Cell>
            </Column>
          </Table>
        </div>
      </div>
    </Panel>
  );
};

export default TradesList;
