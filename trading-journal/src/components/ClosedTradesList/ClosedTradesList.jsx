import React, { useState, useEffect, useCallback } from 'react';
import { Table, SelectPicker, Panel, Pagination } from 'rsuite';
import { getClosedTradesReport, getSetups, getTypes, getAccounts } from '../../api/trades';
import { useAuth } from '../../contexts/AuthContext';
import { ResponsivePie } from '@nivo/pie';
import DateRangePicker from '../UIHelpers/DateRangePicker';

const { Column, HeaderCell, Cell } = Table;

const PieChart = ({ data, title }) => (
  <div style={{ height: '300px', width: '300px' }}>
    <h3 style={{ textAlign: 'center' }}>{title}</h3>
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: 'color', modifiers: [ [ 'darker', 2 ] ] }}
    />
  </div>
);

const ClosedTradesList = () => {
  const { user } = useAuth();
  const [closedTrades, setClosedTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupFilter, setSetupFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [accountFilter, setAccountFilter] = useState(null);
  const [setups, setSetups] = useState([]);
  const [types, setTypes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortColumn, setSortColumn] = useState();
  const [sortType, setSortType] = useState();

  const filterAndSortTrades = useCallback(() => {

    let filtered = closedTrades.filter(trade => {
      const selectedSetup = setups.find(s => s.value === setupFilter);
      const selectedType = types.find(t => t.value === typeFilter);

      const setupMatch = !setupFilter || (trade.setup_name === selectedSetup?.label);
      const typeMatch = !typeFilter || (trade.type_name === selectedType?.label);
      const accountMatch = !accountFilter || (trade.account_id && trade.account_id.toString() === accountFilter);
      
      let dateMatch = true;
      if (dateRange[0] && dateRange[1]) {
        const tradeDate = new Date(trade.last_sell_date);
        dateMatch = tradeDate >= dateRange[0] && tradeDate <= dateRange[1];
      }

      return setupMatch && typeMatch && accountMatch && dateMatch;
    });

    if (sortColumn && sortType) {
      filtered.sort((a, b) => {
        let x = a[sortColumn];
        let y = b[sortColumn];

        // Handle numeric values
        if (typeof x === 'string' && !isNaN(parseFloat(x))) {
          x = parseFloat(x);
          y = parseFloat(y);
        }

        // Handle date values
        if (sortColumn === 'last_sell_date') {
          x = new Date(x);
          y = new Date(y);
        }

        // Handle percentage values
        if (sortColumn.includes('percent')) {
          x = parseFloat(x);
          y = parseFloat(y);
        }

        if (x === null || x === undefined) return sortType === 'asc' ? -1 : 1;
        if (y === null || y === undefined) return sortType === 'asc' ? 1 : -1;

        if (typeof x === 'string') {
          x = x.toLowerCase();
          y = y.toLowerCase();
        }

        if (sortType === 'asc') {
          return x < y ? -1 : x > y ? 1 : 0;
        } else {
          return x > y ? -1 : x < y ? 1 : 0;
        }
      });
    }

    setFilteredTrades(filtered);
  }, [closedTrades, setupFilter, typeFilter, accountFilter, dateRange, sortColumn, sortType, setups, types]);

  useEffect(() => {
    fetchClosedTrades();
    fetchFilterOptions();
  }, [user]);

  useEffect(() => {
    filterAndSortTrades();
  }, [setupFilter, typeFilter, accountFilter, dateRange, filterAndSortTrades]);

  const fetchClosedTrades = async () => {
    try {
      setLoading(true);
      const trades = await getClosedTradesReport(user.id);
      setClosedTrades(trades);
    } catch (error) {
      console.error('Error fetching closed trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const setupsData = await getSetups();
      const typesData = await getTypes();
      const accountsData = await getAccounts();
      setSetups(setupsData.map(setup => ({ label: setup.setup_name, value: setup.id })));
      setTypes(typesData.map(type => ({ label: type.type_name, value: type.id })));
      setAccounts(accountsData.map(account => ({ label: account.account_name, value: account.id.toString() })));
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range || [null, null]);
  };

  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleLimitChange = (limit) => {
    setLimit(limit);
    setPage(1);
  };

  const paginatedTrades = filteredTrades.slice((page - 1) * limit, page * limit);

  const renderPieCharts = () => {
    const setupData = {};
    const typeData = {};
    const monthData = {};

    filteredTrades.forEach(trade => {
      const netPL = parseFloat(trade.net_pl);
      setupData[trade.setup_name] = (setupData[trade.setup_name] || 0) + netPL;
      typeData[trade.type_name] = (typeData[trade.type_name] || 0) + netPL;
      
      // Try to get the date from other fields if last_sell_date is undefined
      let date = new Date(trade.last_sell_date);
      if (date && !isNaN(date.getTime())) {
        const month = date.toLocaleString('default', { month: 'short' });
        monthData[month] = (monthData[month] || 0) + netPL;
      } else {
        console.warn(`No valid date found for trade: ${trade.id}`);
        // If no valid date is found, add to an "Unknown" category
        monthData['Unknown'] = (monthData['Unknown'] || 0) + netPL;
      }
    });

    const createChartData = (data) => 
      Object.entries(data).map(([label, value]) => ({ id: label, label, value: Number(value.toFixed(2)) }));

    const setupChartData = createChartData(setupData);
    const typeChartData = createChartData(typeData);
    const monthChartData = createChartData(monthData);
    
    // Only render charts if there's data
    return (
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        {setupChartData.length > 0 && <PieChart data={setupChartData} title="By Setup" />}
        {typeChartData.length > 0 && <PieChart data={typeChartData} title="By Type" />}
        {monthChartData.length > 0 && <PieChart data={monthChartData} title="By Month" />}
      </div>
    );
  };

  return (
    <Panel header="Closed Trades" bordered>
      <div style={{ marginBottom: '20px' }}>
        <DateRangePicker onChange={handleDateRangeChange} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <SelectPicker 
            data={setups} 
            value={setupFilter} 
            onChange={setSetupFilter} 
            style={{ width: '30%' }}
            placeholder="Filter by Setup" 
            cleanable
          />
          <SelectPicker 
            data={types} 
            value={typeFilter} 
            onChange={setTypeFilter} 
            style={{ width: '30%' }}
            placeholder="Filter by Type" 
            cleanable
          />
          <SelectPicker 
            data={accounts} 
            value={accountFilter} 
            onChange={setAccountFilter} 
            style={{ width: '30%' }}
            placeholder="Filter by Account" 
            cleanable
          />
        </div>
      </div>
      {renderPieCharts()}
      <Table
        height={400}
        data={paginatedTrades}
        loading={loading}
        autoHeight
        sortColumn={sortColumn}
        sortType={sortType}
        onSortColumn={handleSortColumn}
      >
        <Column width={150} sortable>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="name" />
        </Column>
        <Column width={150} sortable>
          <HeaderCell>Account</HeaderCell>
          <Cell dataKey="account_name" />
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Setup</HeaderCell>
          <Cell dataKey="setup_name" />
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Type</HeaderCell>
          <Cell dataKey="type_name" />
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Risk %</HeaderCell>
          <Cell dataKey="risk_percent">{(rowData) => rowData.risk_percent ? `${rowData.risk_percent.toFixed(2)}%` : '-'}</Cell>
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Brokerage</HeaderCell>
          <Cell dataKey="brokerage">{(rowData) => rowData.brokerage ? `₹${rowData.brokerage.toFixed(2)}` : '-'}</Cell>
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Net Buy</HeaderCell>
          <Cell dataKey="net_buy">{(rowData) => rowData.net_buy ? `₹${rowData.net_buy.toFixed(2)}` : '-'}</Cell>
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Net Sell</HeaderCell>
          <Cell dataKey="net_sell">{(rowData) => rowData.net_sell ? `₹${rowData.net_sell.toFixed(2)}` : '-'}</Cell>
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Gross P/L</HeaderCell>
          <Cell dataKey="gross_pl">{(rowData) => rowData.gross_pl ? `₹${rowData.gross_pl.toFixed(2)}` : '-'}</Cell>
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Net P/L</HeaderCell>
          <Cell dataKey="net_pl">{(rowData) => rowData.net_pl ? `₹${parseFloat(rowData.net_pl).toFixed(2)}` : '-'}</Cell>
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Net P/L %</HeaderCell>
          <Cell dataKey="net_pl_percent">{(rowData) => rowData.net_pl_percent ? `${parseFloat(rowData.net_pl_percent).toFixed(2)}%` : '-'}</Cell>
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Stop Loss %</HeaderCell>
          <Cell dataKey="stop_loss_percent">{(rowData) => rowData.stop_loss_percent ? `${rowData.stop_loss_percent.toFixed(2)}%` : '-'}</Cell>
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Days</HeaderCell>
          <Cell dataKey="days" />
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Gross R</HeaderCell>
          <Cell dataKey="gross_r">{(rowData) => rowData.gross_r ? rowData.gross_r.toFixed(2) : '-'}</Cell>
        </Column>
        <Column width={100} sortable>
          <HeaderCell>Net R</HeaderCell>
          <Cell dataKey="net_r">{(rowData) => rowData.net_r ? rowData.net_r.toFixed(2) : '-'}</Cell>
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
          total={filteredTrades.length}
          limitOptions={[10, 30, 50]}
          limit={limit}
          activePage={page}
          onChangePage={handlePageChange}
          onChangeLimit={handleLimitChange}
        />
      </div>
    </Panel>
  );
};

export default ClosedTradesList;