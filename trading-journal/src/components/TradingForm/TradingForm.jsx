import React, { useState } from 'react';
import { Toggle, Panel } from 'rsuite';
import BuyForm from './BuyForm';
import SellForm from './SellForm';

const TradingForm = () => {
  const [position, setPosition] = useState('buy');

  return (
    <Panel header="Trading Form" bordered>
      <div style={{ marginBottom: '20px' }}>
        <Toggle
          checked={position === 'buy'}
          onChange={(checked) => setPosition(checked ? 'buy' : 'sell')}
          checkedChildren="Buy"
          unCheckedChildren="Sell"
        />
      </div>

      {position === 'buy' ? <BuyForm /> : <SellForm />}
    </Panel>
  );
};

export default TradingForm;
