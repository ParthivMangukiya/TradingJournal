import React, { useState, useEffect, useCallback } from 'react';
import { Table } from 'rsuite';
import { getQuarterlyClosedTradesReport } from '../../../api/trades.js';
import { useAuth } from '../../../contexts/AuthContext';
import MonthRangePicker from '../../UIHelpers/MonthRangePicker.jsx';

const { Column, HeaderCell, Cell } = Table;

// Helper function to safely format numbers
const safeNumber = (value, decimals = 2, isPercentage = false) => {
  if (typeof value !== 'number' || isNaN(value)) return '-';
  const formattedValue = value.toFixed(decimals);
  return isPercentage ? `${formattedValue}%` : formattedValue;
};

// Helper function to format date as "Quarter Year"
const formatQuarter = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
};

const QuarterlyTradeReport = () => {
    const { user } = useAuth();
    const [reportData, setReportData] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
  
    const fetchClosedTradesReport = useCallback(async (user, dateRange) => {
      if (!user || !user.id) return;
  
      try {
        const closedTradesReport = await getQuarterlyClosedTradesReport(user.id, dateRange[0], dateRange[1]);
        setReportData(closedTradesReport);
      } catch (error) {
        console.error('Error fetching quarterly closed trades report:', error);
      }
    }, []);
  
    useEffect(() => {
      fetchClosedTradesReport(user, dateRange);
    }, [fetchClosedTradesReport, user, dateRange]);
  
    const handleMonthRangeChange = (start, end) => {
      if (start && end) {
        // Convert start date to the beginning of its quarter
        const startQuarter = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1);
        
        // Convert end date to the end of its quarter
        const endQuarter = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3 + 3, 0);
        
        setDateRange([startQuarter, endQuarter]);
      } else {
        setDateRange([null, null]);
      }
    };
  
    return (
      <div>
        <MonthRangePicker onChange={handleMonthRangeChange} />
        <Table
          height={400}
          data={reportData}
          onSortColumn={(sortColumn, sortType) => {
            console.log(sortColumn, sortType);
          }}
        >
          <Column width={120} align="center" fixed>
          <HeaderCell>Quarter</HeaderCell>
          <Cell>{rowData => formatQuarter(rowData.quarter)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Win Average</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.win_average, 2)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Loss Average</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.loss_average, 2)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>RR</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.rr, 2)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>AWLR</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.awlr, 2)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Win %</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.win_percentage, 2, true)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Total Trades</HeaderCell>
          <Cell>{rowData => rowData.total_trades}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Avg Win Days</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.avg_win_days, 1)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Avg Loss Days</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.avg_loss_days, 1)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Gross R</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.gross_r, 2)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Net R</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.net_r, 2)}</Cell>
        </Column>
      </Table>
    </div>
  );
};
  
export default QuarterlyTradeReport;