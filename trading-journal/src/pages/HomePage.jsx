import React from 'react';
import TradingForm from '../components/TradingForm/TradingForm';
import TradesList from '../components/TradesList/TradesList';
import { Panel, Container, Content } from 'rsuite';

const HomePage = () => {
  return (
    <Container>
      <Content>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '20px' 
        }}>
          <Panel 
            shaded 
            bordered 
            bodyFill 
            style={{ 
              width: '100%', 
              maxWidth: '1200px', 
              marginBottom: '20px' 
            }}
          >
            <TradingForm />
          </Panel>
          <Panel 
            style={{ 
              width: '100%', 
              maxWidth: '1800px' 
            }}
          >
            <TradesList />
          </Panel>
        </div>
      </Content>
    </Container>
  );
};

export default HomePage;