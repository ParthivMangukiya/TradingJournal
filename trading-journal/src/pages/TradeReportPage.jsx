import React, { useState } from 'react';
import { Container, Header, Content, Nav } from 'rsuite';
import MonthlyTradeReport from '../components/TradeReport/MonthlyTradeReport/MonthlyTradeReport';
import QuarterlyTradeReport from '../components/TradeReport/QuarterlyTradeReport/QuarterlyTradeReport';
import YearlyTradeReport from '../components/TradeReport/YearlyTradeReport/YearlyTradeReport';

const TradeReportPage = () => {
  const [activeTab, setActiveTab] = useState('monthly');

  return (
    <Container>
      <Header>
        <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Trade Reports</h2>
      </Header>
      <Content>
        <Nav appearance="tabs" activeKey={activeTab} onSelect={setActiveTab} style={{ marginBottom: '20px' }}>
          <Nav.Item eventKey="monthly">Monthly Report</Nav.Item>
          <Nav.Item eventKey="quarterly">Quarterly Report</Nav.Item>
          <Nav.Item eventKey="yearly">Yearly Report</Nav.Item>
        </Nav>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '90%', maxWidth: '1200px' }}>
            {activeTab === 'monthly' && <MonthlyTradeReport />}
            {activeTab === 'quarterly' && <QuarterlyTradeReport />}
            {activeTab === 'yearly' && <YearlyTradeReport />}
          </div>
        </div>
      </Content>
    </Container>
  );
};

export default TradeReportPage;