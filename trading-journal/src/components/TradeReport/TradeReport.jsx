import React, { useState, useEffect } from 'react';
import { Table } from 'rsuite';
import { getClosedTrades } from '../../api/trades';
import { useAuth } from '../../contexts/AuthContext';

const TradeReport = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClosedTrades();
  }, [user]);

  const fetchClosedTrades = async () => {
    try {
      setLoading(true);
      const closedTrades = await getClosedTrades(user.id);
      const processedData = processTradeData(closedTrades);
      setReportData(processedData);
    } catch (error) {
      console.error('Error fetching closed trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTradeData = (trades) => {
    const monthlyData = {};

    trades.forEach(trade => {
      const buyDate = new Date(trade.buy_transactions[0].buy_date);
      const month = buyDate.toLocaleString('default', { month: 'long' });
      const year = buyDate.getFullYear();
      const key = `${month} ${year}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          grossR: 0,
          netR: 0,
          totalTrades: 0,
          wins: 0,
          losses: 0,
          winTotal: 0,
          lossTotal: 0,
          maxWin: 0,
          maxLoss: 0,
          totalDays: 0,
          winDays: 0,
          lossDays: 0,
        };
      }

      const data = monthlyData[key];
      data.totalTrades++;

      const totalBought = trade.buy_transactions.reduce((sum, t) => sum + (t.quantity * t.buy_price), 0);
      const totalSold = trade.sell_transactions.reduce((sum, t) => sum + (t.quantity * t.sell_price), 0);
      const profit = totalSold - totalBought;
      const riskAmount = trade.buy_transactions[0].quantity * trade.buy_transactions[0].buy_price * (trade.risk_percent / 100);
      const r = profit / riskAmount;

      data.grossR += r;
      // Assuming 1% commission on both buy and sell
      const netProfit = profit - (totalBought * 0.01) - (totalSold * 0.01);
      const netR = netProfit / riskAmount;
      data.netR += netR;

      if (profit > 0) {
        data.wins++;
        data.winTotal += profit;
        data.maxWin = Math.max(data.maxWin, profit);
        const days = (new Date(trade.sell_transactions[0].sell_date) - buyDate) / (1000 * 60 * 60 * 24);
        data.winDays += days;
      } else {
        data.losses++;
        data.lossTotal += Math.abs(profit);
        data.maxLoss = Math.min(data.maxLoss, profit);
        const days = (new Date(trade.sell_transactions[0].sell_date) - buyDate) / (1000 * 60 * 60 * 24);
        data.lossDays += days;
      }

      data.totalDays += (new Date(trade.sell_transactions[0].sell_date) - buyDate) / (1000 * 60 * 60 * 24);
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      grossR: data.grossR.toFixed(2),
      netR: data.netR.toFixed(2),
      totalTrades: data.totalTrades,
      wins: data.wins,
      losses: data.losses,
      winPercentage: ((data.wins / data.totalTrades) * 100).toFixed(1),
      winAverage: data.wins > 0 ? (data.winTotal / data.wins / data.winTotal * 100).toFixed(2) : 0,
      lossAverage: data.losses > 0 ? (data.lossTotal / data.losses / data.lossTotal * 100).toFixed(2) : 0,
      simpleRR: data.losses > 0 ? (data.winAverage / data.lossAverage).toFixed(2) : 0,
      awlr: ((data.winAverage * data.wins) / (data.lossAverage * data.losses)).toFixed(2),
      maxWin: (data.maxWin / data.winTotal * 100).toFixed(2),
      maxLoss: (data.maxLoss / data.lossTotal * 100).toFixed(2),
      maxR: data.maxWin > 0 ? (data.maxWin / (data.winTotal * data.risk_percent / 100)).toFixed(2) : '0.00',
      minR: data.maxLoss < 0 ? (data.maxLoss / (data.lossTotal * data.risk_percent / 100)).toFixed(2) : '0.00',
      avgWinDays: data.wins > 0 ? Math.round(data.winDays / data.wins) : 0,
      avgLossDays: data.losses > 0 ? Math.round(data.lossDays / data.losses) : 0,
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table
      height={400}
      data={reportData}
      onSortColumn={(sortColumn, sortType) => {
        console.log(sortColumn, sortType);
      }}
    >
      <Table.Column width={200} align="center" fixed>
        <Table.HeaderCell>Month</Table.HeaderCell>
        <Table.Cell dataKey="month" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Gross R</Table.HeaderCell>
        <Table.Cell dataKey="grossR" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Net R</Table.HeaderCell>
        <Table.Cell dataKey="netR" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Total Trades</Table.HeaderCell>
        <Table.Cell dataKey="totalTrades" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Wins</Table.HeaderCell>
        <Table.Cell dataKey="wins" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Losses</Table.HeaderCell>
        <Table.Cell dataKey="losses" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Win %</Table.HeaderCell>
        <Table.Cell dataKey="winPercentage" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Win Average</Table.HeaderCell>
        <Table.Cell dataKey="winAverage" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Loss Average</Table.HeaderCell>
        <Table.Cell dataKey="lossAverage" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Simple RR</Table.HeaderCell>
        <Table.Cell dataKey="simpleRR" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>AWLR</Table.HeaderCell>
        <Table.Cell dataKey="awlr" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Max Win</Table.HeaderCell>
        <Table.Cell dataKey="maxWin" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Max Loss</Table.HeaderCell>
        <Table.Cell dataKey="maxLoss" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Max R</Table.HeaderCell>
        <Table.Cell dataKey="maxR" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Min R</Table.HeaderCell>
        <Table.Cell dataKey="minR" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Avg Win Days</Table.HeaderCell>
        <Table.Cell dataKey="avgWinDays" />
      </Table.Column>

      <Table.Column width={100}>
        <Table.HeaderCell>Avg Loss Days</Table.HeaderCell>
        <Table.Cell dataKey="avgLossDays" />
      </Table.Column>
    </Table>
  );
};

export default TradeReport;
