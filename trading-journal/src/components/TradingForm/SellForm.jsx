import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Button,
  DatePicker,
  InputNumber,
  SelectPicker,
  Grid,
  Row,
  Col,
  Message,
  toaster
} from 'rsuite';
import {
  getAccounts,
  getTradesWithRemainingQuantity,
  createSellTransaction,
  // Remove getRemainingQuantity from this line
} from '../../api/trades';
import { useAuth } from '../../contexts/AuthContext';

const SellForm = () => {
  const { user } = useAuth();
  const today = new Date();
  const [formValue, setFormValue] = useState({
    account_id: null,
    trade_id: null,
    quantity: 1,
    sell_price: 0,
    sell_date: today,
    sell_brokerage_percent: 0.25,
    sell_brokerage_value: 0,
  });

  const [accounts, setAccounts] = useState([]);
  const [trades, setTrades] = useState([]);
  const [remainingQuantity, setRemainingQuantity] = useState(0);

  const fetchDropdownData = useCallback(async () => {
    try {
      const accountsData = await getAccounts();
      const tradesData = await getTradesWithRemainingQuantity(user.id);

      setAccounts(accountsData.map(a => ({ label: a.account_name, value: a.id })));
      setTrades(tradesData.map(t => ({ 
        label: `${t.name} (Remaining: ${t.remaining_quantity})`, 
        value: t.id,
        remaining_quantity: t.remaining_quantity
      })));

      // Set default values
      setFormValue(prev => ({
        ...prev,
        account_id: accountsData[0]?.id || null,
        trade_id: tradesData[0]?.id || null,
      }));

      if (tradesData[0]) {
        setRemainingQuantity(tradesData[0].remainingQuantity);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toaster.push(<Message type="error">Error loading form data</Message>);
    }
  }, [user.id, getTradesWithRemainingQuantity, setAccounts, setTrades, setFormValue, setRemainingQuantity]);

  const updateBrokerageValues = useCallback(() => {
    const totalValue = formValue.sell_price * formValue.quantity;
    if (formValue.sell_brokerage_percent !== '') {
      setFormValue(prev => ({
        ...prev,
        sell_brokerage_value: (totalValue * prev.sell_brokerage_percent / 100).toFixed(2)
      }));
    }
  }, [formValue.sell_price, formValue.quantity, formValue.sell_brokerage_percent, setFormValue]);

  const handleBrokerageChange = (field, value) => {
    const totalValue = formValue.sell_price * formValue.quantity;
    if (field === 'sell_brokerage_percent') {
      setFormValue(prev => ({
        ...prev,
        sell_brokerage_percent: value,
        sell_brokerage_value: (totalValue * value / 100).toFixed(2)
      }));
    } else {
      setFormValue(prev => ({
        ...prev,
        sell_brokerage_value: value,
        sell_brokerage_percent: ((value / totalValue) * 100).toFixed(2)
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (formValue.quantity > remainingQuantity) {
        toaster.push(<Message type="error">Quantity exceeds available amount</Message>);
        return;
      }

      // Create sell transaction
      await createSellTransaction(
        formValue.trade_id,
        formValue.sell_price,
        formValue.sell_date,
        formValue.quantity,
        formValue.sell_brokerage_value,
        user.id
      );

      toaster.push(<Message type="success">Sell transaction saved successfully</Message>);

      // Reset form after submission
      setFormValue({
        account_id: accounts[0]?.value || null,
        trade_id: trades[0]?.value || null,
        quantity: 1,
        sell_price: 0,
        sell_date: today,
        sell_brokerage_percent: 0.25,
        sell_brokerage_value: 0,
      });
      setRemainingQuantity(0);
    } catch (error) {
      console.error('Error saving sell transaction:', error);
      toaster.push(<Message type="error">Error saving sell transaction</Message>);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  useEffect(() => {
    updateBrokerageValues();
  }, [updateBrokerageValues]);

  useEffect(() => {
    if (formValue.trade_id) {
      const selectedTrade = trades.find(t => t.value === formValue.trade_id);
      setRemainingQuantity(selectedTrade ? selectedTrade.remaining_quantity : 0);
    }
  }, [formValue.trade_id, trades]);

  return (
    <Form
      fluid
      formValue={formValue}
      onChange={setFormValue}
      onSubmit={handleSubmit}
    >
      <Form.Group>
        <Form.ControlLabel>Account</Form.ControlLabel>
        <Form.Control name="account_id" accepter={SelectPicker} data={accounts} />
      </Form.Group>

      <Form.Group>
        <Form.ControlLabel>Trade</Form.ControlLabel>
        <Form.Control 
          name="trade_id" 
          accepter={SelectPicker} 
          data={trades}
          onChange={(value) => {
            setFormValue({...formValue, trade_id: value});
            const selectedTrade = trades.find(t => t.value === value);
            setRemainingQuantity(selectedTrade ? selectedTrade.remainingQuantity : 0);
          }}
        />
      </Form.Group>
      {formValue.trade_id && (
        <Form.HelpText>
          Remaining quantity for this trade: {remainingQuantity}
        </Form.HelpText>
      )}

      <Form.Group>
        <Grid fluid>
          <Row>
            <Col xs={24} sm={12}>
              <Form.ControlLabel>Quantity</Form.ControlLabel>
              <Form.Control 
                name="quantity" 
                accepter={InputNumber} 
                step={1} 
                min={1} 
                style={{
                  borderColor: formValue.quantity > remainingQuantity ? 'red' : undefined,
                }}
              />
              {formValue.quantity > remainingQuantity && (
                <Form.HelpText style={{ color: 'red' }}>
                  Quantity exceeds available amount
                </Form.HelpText>
              )}
            </Col>
            <Col xs={24} sm={12}>
              <Form.ControlLabel>Sell Price</Form.ControlLabel>
              <Form.Control name="sell_price" accepter={InputNumber} step={0.01} min={0} />
            </Col>
          </Row>
        </Grid>
      </Form.Group>

      <Form.Group>
        <Form.ControlLabel>Sell Date</Form.ControlLabel>
        <Form.Control name="sell_date" accepter={DatePicker} />
      </Form.Group>

      <Form.Group>
        <Form.ControlLabel>Sell Brokerage</Form.ControlLabel>
        <Grid fluid>
          <Row style={{alignItems: 'center'}}>
            <Col xs={10}>
              <Form.Control 
                name="sell_brokerage_percent"
                accepter={InputNumber} 
                step={0.01} 
                min={0}
                onChange={(value) => handleBrokerageChange('sell_brokerage_percent', value)}
              />
            </Col>
            <Col xs={4} style={{display: 'flex', justifyContent: 'center'}}>
              <span style={{color: 'gray', fontSize: '1.2em'}}>
                <span style={{marginRight: '5px'}}>%</span>
                =
              </span>
            </Col>
            <Col xs={10}>
              <Form.Control 
                name="sell_brokerage_value"
                accepter={InputNumber} 
                step={0.01} 
                min={0}
                onChange={(value) => handleBrokerageChange('sell_brokerage_value', value)}
              />
            </Col>
          </Row>
        </Grid>
      </Form.Group>

      <Form.Group>
        <Button appearance="primary" type="submit">
          Submit Sell Trade
        </Button>
      </Form.Group>
    </Form>
  );
};

export default SellForm;