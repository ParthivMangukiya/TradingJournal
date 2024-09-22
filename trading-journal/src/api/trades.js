import { supabase } from '../config/supabase-client';

// Trades
export const getTrades = async () => {
  const { data, error } = await supabase
    .from('trades')
    .select('*');
  if (error) throw error;
  return data;
};

export const createTrade = async (
  creation_date,
  account_id,
  name,
  setup_id,
  type_id,
  market_id,
  group_rank,
  pro_score,
  one_week_rs,
  one_month_rs,
  risk_percent,
  user_id
) => {
  const { data, error } = await supabase
    .from('trades')
    .insert([{
      creation_date,
      account_id,
      name,
      setup_id,
      type_id,
      market_id,
      group_rank,
      pro_score,
      one_week_rs,
      one_month_rs,
      risk_percent,
      user_id
    }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateTrade = async (
  id,
  creation_date,
  account_id,
  name,
  setup_id,
  type_id,
  market_id,
  group_rank,
  pro_score,
  one_week_rs,
  one_month_rs,
  risk_percent
) => {
  const { data, error } = await supabase
    .from('trades')
    .update({
      creation_date,
      account_id,
      name,
      setup_id,
      type_id,
      market_id,
      group_rank,
      pro_score,
      one_week_rs,
      one_month_rs,
      risk_percent
    })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

// Market
export const getMarkets = async () => {
  const { data, error } = await supabase
    .from('market')
    .select('*');
  if (error) throw error;
  return data;
};

export const createMarket = async (market_name, user_id) => {
  const { data, error } = await supabase
    .from('market')
    .insert([{ market_name, user_id }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateMarket = async (id, market_name) => {
  const { data, error } = await supabase
    .from('market')
    .update({ market_name })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteMarket = async (id) => {
  const { data, error } = await supabase
    .from('market')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};

// Setup
export const getSetups = async () => {
  const { data, error } = await supabase
    .from('setup')
    .select('*');
  if (error) throw error;
  return data;
};

export const createSetup = async (setup_name, user_id) => {
  const { data, error } = await supabase
    .from('setup')
    .insert([{ setup_name, user_id }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateSetup = async (id, setup_name) => {
  const { data, error } = await supabase
    .from('setup')
    .update({ setup_name })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteSetup = async (id) => {
  const { data, error } = await supabase
    .from('setup')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};

// Type
export const getTypes = async () => {
  const { data, error } = await supabase
    .from('type')
    .select(`
      *,
      setup:setup_id (
        id,
        setup_name
      )
    `);
  if (error) throw error;
  return data;
};

export const createType = async (typeName, userId, setupId) => {
  const { data, error } = await supabase
    .from('type')
    .insert({ type_name: typeName, user_id: userId, setup_id: setupId })
    .select();
  if (error) throw error;
  return data[0];
};

export const updateType = async (id, typeName, setupId) => {
  const { data, error } = await supabase
    .from('type')
    .update({ type_name: typeName, setup_id: setupId })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteType = async (id) => {
  const { data, error } = await supabase
    .from('type')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return data;
};

// Buy Transactions
export const getBuyTransactions = async (tradeId) => {
  const { data, error } = await supabase
    .from('buy_transactions')
    .select('*')
    .eq('trade_id', tradeId);
  if (error) throw error;
  return data;
};

export const createBuyTransaction = async (
  trade_id,
  buy_price,
  buy_date,
  quantity,
  initial_stop,
  stop_loss_percent,
  buy_brokerage,
  user_id
) => {
  const { data, error } = await supabase
    .from('buy_transactions')
    .insert([{
      trade_id,
      buy_price,
      buy_date,
      quantity,
      initial_stop,
      stop_loss_percent,
      buy_brokerage,
      user_id
    }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateBuyTransaction = async (
  id,
  buy_price,
  buy_date,
  quantity,
  initial_stop,
  stop_loss_percent,
  buy_brokerage,
  user_id
) => {
  const { data, error } = await supabase
    .from('buy_transactions')
    .update({
      buy_price,
      buy_date,
      quantity,
      initial_stop,
      stop_loss_percent,
      buy_brokerage,
      user_id
    })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

// Sell Transactions
export const getSellTransactions = async (tradeId) => {
  const { data, error } = await supabase
    .from('sell_transactions')
    .select('*')
    .eq('trade_id', tradeId);
  if (error) throw error;
  return data;
};

export const createSellTransaction = async (
  trade_id,
  sell_price,
  sell_date,
  quantity,
  sell_brokerage,
  user_id
) => {
  const { data, error } = await supabase
    .from('sell_transactions')
    .insert([{
      trade_id,
      sell_price,
      sell_date,
      quantity,
      sell_brokerage,
      user_id
    }])
    .select();
  if (error) throw error;
  return data[0];
};

export const updateSellTransaction = async (
  id,
  sell_price,
  sell_date,
  quantity,
  sell_brokerage,
  user_id
) => {
  const { data, error } = await supabase
    .from('sell_transactions')
    .update({
      sell_price,
      sell_date,
      quantity,
      sell_brokerage,
      user_id
    })
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

// Accounts
export const getAccounts = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*');
  if (error) throw error;
  return data;
};

// Add this function to create a new account
export const createAccount = async (account_name, user_id) => {
  const { data, error } = await supabase
    .from('accounts')
    .insert([{ account_name, user_id }])
    .select();
  if (error) throw error;
  return data[0];
};

// Add this function to the trades.js file
export const getRemainingQuantity = async (tradeId) => {
  const { data: buyTransactions, error: buyError } = await supabase
    .from('buy_transactions')
    .select('quantity')
    .eq('trade_id', tradeId);

  const { data: sellTransactions, error: sellError } = await supabase
    .from('sell_transactions')
    .select('quantity')
    .eq('trade_id', tradeId);

  if (buyError || sellError) throw buyError || sellError;

  const totalBought = buyTransactions.reduce((sum, transaction) => sum + transaction.quantity, 0);
  const totalSold = sellTransactions.reduce((sum, transaction) => sum + transaction.quantity, 0);

  return totalBought - totalSold;
};

export const getTradesWithRemainingQuantity = async (userId) => {
  const { data, error } = await supabase
    .rpc('get_trades_with_remaining_quantity', { user_id: userId });

  if (error) throw error;

  return data.filter(trade => trade.remaining_quantity > 0);
};

export const getClosedTrades = async (userId) => {
  const { data, error } = await supabase
    .from('trades')
    .select(`
      *,
      buy_transactions(*),
      sell_transactions(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;

  // Filter closed trades (where total sold quantity equals total bought quantity)
  return data.filter(trade => {
    const totalBought = trade.buy_transactions.reduce((sum, t) => sum + t.quantity, 0);
    const totalSold = trade.sell_transactions.reduce((sum, t) => sum + t.quantity, 0);
    return totalBought === totalSold;
  });
};

export const deleteTrade = async (tradeId) => {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', tradeId);

  if (error) throw error;
};

export const getClosedTradesReport = async (userId, startDate = null, endDate = null) => {
  // Convert dates to ISO string format (YYYY-MM-DD)
  const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
  const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : null;
  const { data, error } = await supabase
    .rpc('get_closed_trades_report', { 
      p_user_id: userId,
      p_start_date: formattedStartDate,
      p_end_date: formattedEndDate
    });

  if (error) {
    console.error('Error fetching closed trades report:', error);
    throw error;
  }

  return data;
};

export const getMonthlyClosedTradesReport = async (userId, startDate = null, endDate = null) => {
  // Convert dates to ISO string format (YYYY-MM-DD)
  const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
  const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : null;

  const { data, error } = await supabase
    .rpc('get_monthly_closed_trades_report', { 
      p_user_id: userId,
      p_start_date: formattedStartDate,
      p_end_date: formattedEndDate
    });

  if (error) {
    console.error('Error fetching monthly closed trades report:', error);
    throw error;
  }

  return data;
};

export const getQuarterlyClosedTradesReport = async (userId, startDate = null, endDate = null) => {
  // Convert dates to ISO string format (YYYY-MM-DD)
  const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
  const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : null;

  const { data, error } = await supabase
    .rpc('get_quarterly_closed_trades_report', { 
      p_user_id: userId,
      p_start_date: formattedStartDate,
      p_end_date: formattedEndDate
    });

  if (error) {
    console.error('Error fetching quarterly closed trades report:', error);
    throw error;
  }

  return data;
};

export const getYearlyClosedTradesReport = async (userId, startDate = null, endDate = null) => {
  // Convert dates to ISO string format (YYYY-MM-DD)
  const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
  const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : null;

  const { data, error } = await supabase
    .rpc('get_yearly_closed_trades_report', { 
      p_user_id: userId,
      p_start_date: formattedStartDate,
      p_end_date: formattedEndDate
    });

  if (error) {
    console.error('Error fetching yearly closed trades report:', error);
    throw error;
  }

  return data;
};