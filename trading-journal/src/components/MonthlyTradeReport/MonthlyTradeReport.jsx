import React, { useState, useEffect, useCallback } from 'react';
import { Table } from 'rsuite';
import { getMonthlyClosedTradesReport } from '../../../api/trades.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import MonthRangePicker from '../UIHelpers/MonthRangePicker.jsx';

const { Column, HeaderCell, Cell } = Table;

// Helper function to safely format numbers
const safeNumber = (value, decimals = 2) => {
  return typeof value === 'number' ? value.toFixed(decimals) : '-';
};

// Helper function to format date as "Month Year"
const formatMonth = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const MonthlyTradeReport = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);

  const fetchClosedTradesReport = useCallback(async (user, dateRange) => {
    if (!user || !user.id) return;

    try {
      const closedTradesReport = await getMonthlyClosedTradesReport(user.id, dateRange[0], dateRange[1]);
      setReportData(closedTradesReport);
    } catch (error) {
      console.error('Error fetching closed trades report:', error);
    }
  }, []);

  useEffect(() => {
    fetchClosedTradesReport(user, dateRange);
  }, [fetchClosedTradesReport, user, dateRange]);

  const handleMonthRangeChange = (start, end) => {
    if (start && end) {
      const startDate = new Date(start.getFullYear(), start.getMonth(), 1);
      const endDate = new Date(end.getFullYear(), end.getMonth(), 31);
      setDateRange([startDate, endDate]);
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
          <HeaderCell>Month</HeaderCell>
          <Cell>{rowData => formatMonth(rowData.month)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Gross R</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.gross_r)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Net R</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.net_r)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Total Trades</HeaderCell>
          <Cell dataKey="total_trades" />
        </Column>

        <Column width={80}>
          <HeaderCell>Wins</HeaderCell>
          <Cell dataKey="wins" />
        </Column>

        <Column width={80}>
          <HeaderCell>Losses</HeaderCell>
          <Cell dataKey="losses" />
        </Column>

        <Column width={80}>
          <HeaderCell>Win %</HeaderCell>
          <Cell>{rowData => {
            const winPercentage = rowData.total_trades > 0 ? (rowData.wins / rowData.total_trades) * 100 : 0;
            return safeNumber(winPercentage);
          }}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Win Average</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.win_average)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Loss Average</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.loss_average)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Simple RR</HeaderCell>
          <Cell>{rowData => {
            const simpleRR = rowData.loss_average !== 0 ? rowData.win_average / Math.abs(rowData.loss_average) : 0;
            return safeNumber(simpleRR);
          }}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>AWLR</HeaderCell>
          <Cell>{rowData => {
            const winRate = rowData.total_trades > 0 ? rowData.wins / rowData.total_trades : 0;
            const lossRate = 1 - winRate;
            const awlr = (lossRate * Math.abs(rowData.loss_average)) !== 0 
              ? (winRate * rowData.win_average) / (lossRate * Math.abs(rowData.loss_average))
              : 0;
            return safeNumber(awlr);
          }}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Max Win</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.max_win)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Max Loss</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.max_loss)}</Cell>
        </Column>

        <Column width={80}>
          <HeaderCell>Max R</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.max_r)}</Cell>
        </Column>

        <Column width={80}>
          <HeaderCell>Min R</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.min_r)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Avg Win Days</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.avg_win_days, 1)}</Cell>
        </Column>

        <Column width={100}>
          <HeaderCell>Avg Loss Days</HeaderCell>
          <Cell>{rowData => safeNumber(rowData.avg_loss_days, 1)}</Cell>
        </Column>
      </Table>
    </div>
  );
};

export default MonthlyTradeReport;
