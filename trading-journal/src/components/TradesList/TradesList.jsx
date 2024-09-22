import React, { useState, useEffect, useCallback } from 'react';
import { Table, InputGroup, Input, Panel, TagPicker, Tag, IconButton, toaster, Message, Pagination } from 'rsuite';
import { getTrades, getBuyTransactions, getSellTransactions, getSetups, getTypes, getMarkets, getAccounts, deleteTrade } from '../../api/trades';
import { useAuth } from '../../contexts/AuthContext';
import TrashIcon from '@rsuite/icons/Trash';
import DateRangePicker from '../UIHelpers/DateRangePicker';

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
  const [accounts, setAccounts] = useState([]);
  const [selectedSetups, setSelectedSetups] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchTrades();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    filterTrades();
  }, [searchKeyword, selectedSetups, selectedTypes, selectedMarkets, selectedAccounts, dateRange, trades, page, limit, sortColumn, sortType]);

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
      const accountsData = await getAccounts();
      setSetups(setupsData.map(setup => ({ label: setup.setup_name, value: setup.id })));
      setTypes(typesData.map(type => ({ label: type.type_name, value: type.id })));
      setMarkets(marketsData.map(market => ({ label: market.market_name, value: market.id })));
      setAccounts(accountsData.map(account => ({ label: account.account_name, value: account.id })));
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
    setPage(1); // Reset to first page when sorting
  };

  const filterTrades = useCallback(() => {
    let filtered = trades.filter((trade) =>
      trade.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    // Apply setup, type, market, and account filters
    if (selectedSetups.length > 0) {
      filtered = filtered.filter(trade => selectedSetups.includes(trade.setup_id));
    }
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(trade => selectedTypes.includes(trade.type_id));
    }
    if (selectedMarkets.length > 0) {
      filtered = filtered.filter(trade => selectedMarkets.includes(trade.market_id));
    }
    if (selectedAccounts.length > 0) {
      filtered = filtered.filter(trade => selectedAccounts.includes(trade.account_id));
    }

    // Apply date filter and flatten the trade data
    filtered = filtered.flatMap(trade => {
      const buyRows = (trade.buyTransactions || []).map(transaction => ({
        ...trade,
        ...transaction,
        type: 'Buy',
        price: transaction.buy_price,
        date: transaction.buy_date,
        brokerage: transaction.buy_brokerage,
        setup: setups.find(s => s.value === trade.setup_id)?.label || '',
        market: markets.find(m => m.value === trade.market_id)?.label || '',
        account_name: accounts.find(a => a.value === trade.account_id)?.label || ''
      }));
      const sellRows = (trade.sellTransactions || []).map(transaction => ({
        ...trade,
        ...transaction,
        type: 'Sell',
        price: transaction.sell_price,
        date: transaction.sell_date,
        brokerage: transaction.sell_brokerage,
        setup: setups.find(s => s.value === trade.setup_id)?.label || '',
        market: markets.find(m => m.value === trade.market_id)?.label || '',
        account_name: accounts.find(a => a.value === trade.account_id)?.label || ''
      }));
      return buyRows.length > 0 || sellRows.length > 0 ? buyRows.concat(sellRows) : [{
        ...trade,
        type: 'No Transactions',
        setup: setups.find(s => s.value === trade.setup_id)?.label || '',
        market: markets.find(m => m.value === trade.market_id)?.label || '',
        account_name: accounts.find(a => a.value === trade.account_id)?.label || ''
      }];
    }).filter(row => {
      const transactionDate = new Date(row.date);
      if (dateRange[0] && dateRange[1]) {
        return transactionDate >= dateRange[0] && transactionDate <= dateRange[1];
      }
      return true;
    });

    // Apply sorting
    if (sortColumn && sortType) {
      filtered.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];

        switch (sortColumn) {
          case 'setup':
          case 'market':
          case 'type':
          case 'account_name':
            // These are already strings, so no need to change
            break;
          case 'price':
          case 'brokerage':
          case 'risk_percent':
          case 'initial_stop':
          case 'stop_loss_percent':
            x = parseFloat(x) || 0;
            y = parseFloat(y) || 0;
            break;
          case 'date':
            x = new Date(x);
            y = new Date(y);
            break;
          default:
            // For other columns, convert to lowercase if string
            if (typeof x === 'string') x = x.toLowerCase();
            if (typeof y === 'string') y = y.toLowerCase();
        }

        if (sortType === 'asc') {
          return x < y ? -1 : x > y ? 1 : 0;
        } else {
          return x > y ? -1 : x < y ? 1 : 0;
        }
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTrades = filtered.slice(startIndex, endIndex);

    setFilteredTrades(paginatedTrades);
  }, [trades, searchKeyword, selectedSetups, selectedTypes, selectedMarkets, selectedAccounts, dateRange, page, limit, sortColumn, sortType, setups, types, markets, accounts]);

  const TransactionTag = ({ type }) => (
    <Tag color={type === 'Buy' ? 'red' : 'blue'} style={{ marginRight: '5px' }}>
      {type}
    </Tag>
  );

  const handleDateRangeChange = (start, end) => {
    setDateRange([start, end]);
  };

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

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing items per page
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
          <DateRangePicker onChange={handleDateRangeChange} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <TagPicker
            data={setups}
            placeholder="Filter by Setup"
            style={{ width: '22%' }}
            onChange={setSelectedSetups}
          />
          <TagPicker
            data={types}
            placeholder="Filter by Type"
            style={{ width: '22%' }}
            onChange={setSelectedTypes}
          />
          <TagPicker
            data={markets}
            placeholder="Filter by Market"
            style={{ width: '22%' }}
            onChange={setSelectedMarkets}
          />
          <TagPicker
            data={accounts}
            placeholder="Filter by Account"
            style={{ width: '22%' }}
            onChange={setSelectedAccounts}
          />
        </div>
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
            <Column width={50} align="center" fixed sortable>
              <HeaderCell>Trade</HeaderCell>
              <Cell>
                {rowData => <ColorDot tradeId={rowData.id} />}
              </Cell>
            </Column>
            <Column width={120} align="center" fixed sortable>
              <HeaderCell>Trade Name</HeaderCell>
              <Cell dataKey="name" />
            </Column>
            <Column width={120} align="center" sortable>
              <HeaderCell>Account</HeaderCell>
              <Cell dataKey="account_name" />
            </Column>
            <Column width={100} align="center" sortable>
              <HeaderCell>Creation Date</HeaderCell>
              <Cell dataKey="creation_date" />
            </Column>
            <Column width={80} align="center" sortable>
              <HeaderCell>Setup</HeaderCell>
              <Cell dataKey="setup" />
            </Column>
            <Column width={80} align="center" sortable>
              <HeaderCell>Type</HeaderCell>
              <Cell dataKey="type" />
            </Column>
            <Column width={80} align="center" sortable>
              <HeaderCell>Market</HeaderCell>
              <Cell dataKey="market" />
            </Column>
            <Column width={60} align="center" sortable>
              <HeaderCell>Rank</HeaderCell>
              <Cell dataKey="group_rank" />
            </Column>
            <Column width={60} align="center" sortable>
              <HeaderCell>Risk %</HeaderCell>
              <Cell dataKey="risk_percent">
                {rowData => rowData.risk_percent ? `${rowData.risk_percent}%` : '-'}
              </Cell>
            </Column>
            <Column width={100} align="center" sortable>
              <HeaderCell>Transaction</HeaderCell>
              <Cell dataKey="type">
                {rowData => <TransactionTag type={rowData.type} />}
              </Cell>
            </Column>
            <Column width={100} align="center" sortable>
              <HeaderCell>Quantity</HeaderCell>
              <Cell dataKey="quantity" />
            </Column>
            <Column width={100} align="center" sortable>
              <HeaderCell>Price</HeaderCell>
              <Cell dataKey="price">
                {rowData => rowData.price ? `₹${rowData.price.toFixed(2)}` : '-'}
              </Cell>
            </Column>
            <Column width={120} align="center" sortable>
              <HeaderCell>Date</HeaderCell>
              <Cell dataKey="date">
                {rowData => rowData.date ? new Date(rowData.date).toLocaleDateString() : '-'}
              </Cell>
            </Column>
            <Column width={100} align="center" sortable>
              <HeaderCell>Brokerage</HeaderCell>
              <Cell dataKey="brokerage">
                {rowData => rowData.brokerage ? `₹${rowData.brokerage.toFixed(2)}` : '-'}
              </Cell>
            </Column>
            <Column width={100} align="center" sortable>
              <HeaderCell>Initial Stop</HeaderCell>
              <Cell dataKey="initial_stop">
                {rowData => rowData.initial_stop ? `${rowData.initial_stop}%` : '-'}
              </Cell>
            </Column>
            <Column width={100} align="center" sortable>
              <HeaderCell>Stop Loss %</HeaderCell>
              <Cell dataKey="stop_loss_percent">
                {rowData => rowData.stop_loss_percent ? `${rowData.stop_loss_percent}%` : '-'}
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
          <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
            <Pagination
              prev
              next
              first
              last
              ellipsis
              boundaryLinks
              maxButtons={5}
              size="md"
              layout={['total', '-', 'limit', '|', 'pager', 'skip']}
              total={trades.length}
              limitOptions={[10, 30, 50]}
              limit={limit}
              activePage={page}
              onChangePage={handlePageChange}
              onChangeLimit={handleLimitChange}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default TradesList;
