import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  DatePicker,
  InputNumber,
  Input,
  SelectPicker,
  Grid,
  Row,
  Col,
  Message,
  toaster
} from 'rsuite';
import {
  getAccounts,
  getMarkets,
  getSetups,
  getTypes,
  createTrade,
  createBuyTransaction
} from '../../api/trades';
import { useAuth } from '../../contexts/AuthContext';

const BuyForm = () => {
  const { user } = useAuth();
  const today = new Date();
  const [formValue, setFormValue] = useState({
    account_id: null,
    name: '',
    setup_id: null,
    type_id: null,
    market_id: null,
    group_rank: '',
    pro_score: '',
    one_week_rs: '',
    one_month_rs: '',
    risk_percent: '',
    quantity: 1,
    buy_price: 0,
    buy_date: today,
    stop_loss_percent: '',
    stop_loss_value: '',
    buy_brokerage_percent: 0.25,
    buy_brokerage_value: 0,
  });

  const [accounts, setAccounts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [setups, setSetups] = useState([]);
  const [types, setTypes] = useState([]);
  const [setupTypes, setSetupTypes] = useState({});
  const [availableTypes, setAvailableTypes] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const updateBrokerageValues = useCallback(() => {
    const totalValue = formValue.buy_price * formValue.quantity;
    if (formValue.buy_brokerage_percent !== '') {
      setFormValue(prev => ({
        ...prev,
        buy_brokerage_value: (totalValue * prev.buy_brokerage_percent / 100).toFixed(2)
      }));
    }
  }, [formValue.buy_price, formValue.quantity, formValue.buy_brokerage_percent]);

  const updateStopLossValue = useCallback(() => {
    if (formValue.stop_loss_percent !== '' && formValue.buy_price !== '') {
      const stopLossValue = formValue.buy_price * (100 - formValue.stop_loss_percent) / 100;
      setFormValue(prev => ({
        ...prev,
        stop_loss_value: stopLossValue.toFixed(2)
      }));
    }
  }, [formValue.stop_loss_percent, formValue.buy_price]);

  useEffect(() => {
    updateBrokerageValues();
    updateStopLossValue();
  }, [updateBrokerageValues, updateStopLossValue]);

  const fetchDropdownData = async () => {
    try {
      const accountsData = await getAccounts();
      const marketsData = await getMarkets();
      const setupsData = await getSetups();
      const typesData = await getTypes();

      setAccounts(accountsData.map(a => ({ label: a.account_name, value: a.id.toString() })));
      setMarkets(marketsData.map(m => ({ label: m.market_name, value: m.id.toString() })));
      
      const setupsFormatted = setupsData.map(s => ({ label: s.setup_name, value: s.id.toString() }));
      setSetups(setupsFormatted);

      const allTypes = typesData.map(t => ({ label: t.type_name, value: t.id.toString() }));
      setTypes(allTypes);

      // Create setup to types mapping
      const setupTypesMap = {};
      typesData.forEach(type => {
        const setupId = type.setup_id.toString();
        if (!setupTypesMap[setupId]) {
          setupTypesMap[setupId] = [];
        }
        setupTypesMap[setupId].push({ label: type.type_name, value: type.id.toString() });
      });
      setSetupTypes(setupTypesMap);

      // Set default setup and type
      if (setupsFormatted.length > 0) {
        const defaultSetup = setupsFormatted[0].value;
        const defaultTypes = setupTypesMap[defaultSetup] || [];
        setFormValue(prev => ({
          ...prev,
          setup_id: defaultSetup,
          type_id: defaultTypes.length > 0 ? defaultTypes[0].value : null
        }));
        setAvailableTypes(defaultTypes);
      }

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toaster.push(<Message type="error">Error loading form data</Message>);
    }
  };

  const handleSetupChange = (value) => {
    setFormValue(prev => {
      const newState = { ...prev, setup_id: value };
      if (value) {
        const typesForSetup = setupTypes[value] || [];
        setAvailableTypes(typesForSetup);
        newState.type_id = typesForSetup.length > 0 ? typesForSetup[0].value : null;
      } else {
        setAvailableTypes([]);
        newState.type_id = null;
      }
      return newState;
    });
  };

  const handleTypeChange = (value) => {
    setFormValue(prev => ({ ...prev, type_id: value }));
  };

  const handleBrokerageChange = (field, value) => {
    const totalValue = formValue.buy_price * formValue.quantity;
    if (field === 'buy_brokerage_percent') {
      setFormValue(prev => ({
        ...prev,
        buy_brokerage_percent: value,
        buy_brokerage_value: (totalValue * value / 100).toFixed(2)
      }));
    } else {
      setFormValue(prev => ({
        ...prev,
        buy_brokerage_value: value,
        buy_brokerage_percent: ((value / totalValue) * 100).toFixed(2)
      }));
    }
  };

  const handleStopLossChange = (field, value) => {
    if (field === 'stop_loss_percent') {
      setFormValue(prev => ({
        ...prev,
        stop_loss_percent: value,
        stop_loss_value: (prev.buy_price * (100 - value) / 100).toFixed(2)
      }));
    } else {
      setFormValue(prev => ({
        ...prev,
        stop_loss_value: value,
        stop_loss_percent: ((prev.buy_price - value) / prev.buy_price * 100).toFixed(2)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate and prepare numeric fields
      const numericFields = [
        'one_week_rs',
        'one_month_rs',
        'risk_percent',
        'quantity',
        'buy_price',
        'stop_loss_percent',
        'stop_loss_value',
        'buy_brokerage_percent',
        'buy_brokerage_value'
      ];

      const preparedFormValue = { ...formValue };

      numericFields.forEach(field => {
        if (preparedFormValue[field] === '' || preparedFormValue[field] === null) {
          preparedFormValue[field] = null; // or 0, depending on your requirements
        } else {
          preparedFormValue[field] = parseFloat(preparedFormValue[field]);
        }
      });

      // Create trade entry
      const tradeData = await createTrade(
        preparedFormValue.buy_date,
        preparedFormValue.account_id,
        preparedFormValue.name,
        preparedFormValue.setup_id,
        preparedFormValue.type_id,
        preparedFormValue.market_id,
        preparedFormValue.group_rank,
        preparedFormValue.pro_score,
        preparedFormValue.one_week_rs,
        preparedFormValue.one_month_rs,
        preparedFormValue.risk_percent,
        user.id
      );

      // Create buy transaction
      await createBuyTransaction(
        tradeData.id,
        preparedFormValue.buy_price,
        preparedFormValue.buy_date,
        preparedFormValue.quantity,
        preparedFormValue.stop_loss_value,
        preparedFormValue.stop_loss_percent,
        preparedFormValue.buy_brokerage_value,
        user.id
      );

      toaster.push(<Message type="success">Trade saved successfully</Message>);

      // Reset form after submission
      setFormValue({
        account_id: accounts[0]?.value || null,
        name: '',
        setup_id: setups[0]?.value || null,
        type_id: types[0]?.value || null,
        market_id: markets[0]?.value || null,
        group_rank: '',
        pro_score: '',
        one_week_rs: '',
        one_month_rs: '',
        risk_percent: '',
        quantity: 1,
        buy_price: 0,
        buy_date: today,
        stop_loss_percent: '',
        stop_loss_value: '',
        buy_brokerage_percent: 0.25,
        buy_brokerage_value: 0,
      });
    } catch (error) {
      console.error('Error saving trade:', error);
      toaster.push(<Message type="error">Error saving trade: {error.message}</Message>);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid fluid>
        <Row>
          <Col xs={24}>
            <label>Account</label>
            <SelectPicker 
              data={accounts} 
              value={formValue.account_id}
              onChange={(value) => setFormValue({...formValue, account_id: value})}
              block
              cleanable
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <label>Name</label>
            <Input 
              value={formValue.name}
              onChange={(value) => setFormValue({...formValue, name: value})}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24} sm={8}>
            <label>Setup</label>
            <SelectPicker 
              data={setups} 
              value={formValue.setup_id}
              onChange={handleSetupChange}
              block
              cleanable={false}
            />
          </Col>
          <Col xs={24} sm={8}>
            <label>Type</label>
            <SelectPicker 
              data={availableTypes} 
              value={formValue.type_id}
              onChange={handleTypeChange}
              block
              cleanable={false}
              disabled={!formValue.setup_id}
            />
          </Col>
          <Col xs={24} sm={8}>
            <label>Market</label>
            <SelectPicker 
              data={markets} 
              value={formValue.market_id}
              onChange={(value) => setFormValue({...formValue, market_id: value})}
              block
              cleanable
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24} sm={12}>
            <label>Group Rank</label>
            <Input 
              value={formValue.group_rank}
              onChange={(value) => setFormValue({...formValue, group_rank: value})}
            />
          </Col>
          <Col xs={24} sm={12}>
            <label>Pro Score</label>
            <Input 
              value={formValue.pro_score}
              onChange={(value) => setFormValue({...formValue, pro_score: value})}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24} sm={12}>
            <label>1 Week RS</label>
            <InputNumber 
              value={formValue.one_week_rs}
              onChange={(value) => setFormValue({...formValue, one_week_rs: value})}
              step={0.01}
            />
          </Col>
          <Col xs={24} sm={12}>
            <label>1 Month RS</label>
            <InputNumber 
              value={formValue.one_month_rs}
              onChange={(value) => setFormValue({...formValue, one_month_rs: value})}
              step={0.01}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <label>Risk %</label>
            <InputNumber 
              value={formValue.risk_percent}
              onChange={(value) => setFormValue({...formValue, risk_percent: value})}
              step={0.01}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24} sm={12}>
            <label>Quantity</label>
            <InputNumber 
              value={formValue.quantity}
              onChange={(value) => setFormValue({...formValue, quantity: value})}
              step={1}
              min={1}
            />
          </Col>
          <Col xs={24} sm={12}>
            <label>Buy Price</label>
            <InputNumber 
              value={formValue.buy_price}
              onChange={(value) => setFormValue({...formValue, buy_price: value})}
              step={0.01}
              min={0}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <label>Buy Date</label>
            <DatePicker 
              value={formValue.buy_date}
              onChange={(value) => setFormValue({...formValue, buy_date: value})}
            />
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <label>Stop Loss</label>
            <Grid fluid>
              <Row style={{alignItems: 'center'}}>
                <Col xs={10}>
                  <InputNumber 
                    value={formValue.stop_loss_percent}
                    onChange={(value) => handleStopLossChange('stop_loss_percent', value)}
                    step={0.01}
                    min={0}
                    max={100}
                  />
                </Col>
                <Col xs={4} style={{display: 'flex', justifyContent: 'center'}}>
                  <span style={{color: 'gray', fontSize: '1.2em'}}>
                    <span style={{marginRight: '5px'}}>%</span>
                    =
                  </span>
                </Col>
                <Col xs={10}>
                  <InputNumber 
                    value={formValue.stop_loss_value}
                    onChange={(value) => handleStopLossChange('stop_loss_value', value)}
                    step={0.01}
                    min={0}
                  />
                </Col>
              </Row>
            </Grid>
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            <label>Buy Brokerage</label>
            <Grid fluid>
              <Row style={{alignItems: 'center'}}>
                <Col xs={10}>
                  <InputNumber 
                    value={formValue.buy_brokerage_percent}
                    onChange={(value) => handleBrokerageChange('buy_brokerage_percent', value)}
                    step={0.01}
                    min={0}
                  />
                </Col>
                <Col xs={4} style={{display: 'flex', justifyContent: 'center'}}>
                  <span style={{color: 'gray', fontSize: '1.2em'}}>
                    <span style={{marginRight: '5px'}}>%</span>
                    =
                  </span>
                </Col>
                <Col xs={10}>
                  <InputNumber 
                    value={formValue.buy_brokerage_value}
                    onChange={(value) => handleBrokerageChange('buy_brokerage_value', value)}
                    step={0.01}
                    min={0}
                  />
                </Col>
              </Row>
            </Grid>
          </Col>
        </Row>

        <Row style={{ marginTop: '20px' }}>
          <Col xs={24}>
            <Button appearance="primary" type="submit">
              Submit Buy Trade
            </Button>
          </Col>
        </Row>
      </Grid>
    </form>
  );
};

export default BuyForm;