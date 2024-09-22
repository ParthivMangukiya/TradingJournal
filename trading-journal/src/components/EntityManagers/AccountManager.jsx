import React from 'react';
import EntityManager from './EntityManager';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../../api/trades';
import { supabase } from '../../config/supabase-client';

const checkCanDeleteAccount = async (accountId) => {
  const { count, error } = await supabase
    .from('trades')
    .select('id', { count: 'exact' })
    .eq('account_id', accountId);

  if (error) throw error;
  return count === 0;
};

const AccountManager = () => (
  <EntityManager
    entityNameProp="account"
    getEntities={getAccounts}
    createEntity={createAccount}
    updateEntity={updateAccount}
    deleteEntity={deleteAccount}
    checkCanDelete={checkCanDeleteAccount}
  />
);

export default AccountManager;
