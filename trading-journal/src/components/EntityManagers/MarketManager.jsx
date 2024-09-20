import React from 'react';
import EntityManager from './EntityManager';
import { getMarkets, createMarket, updateMarket, deleteMarket } from '../../api/trades';
import { supabase } from '../../config/supabase-client';

const checkCanDeleteMarket = async (marketId) => {
  const { count, error } = await supabase
    .from('trades')
    .select('id', { count: 'exact' })
    .eq('market_id', marketId);

  if (error) throw error;
  return count === 0;
};

const MarketManager = () => (
  <EntityManager
    entityNameProp="market"
    getEntities={getMarkets}
    createEntity={createMarket}
    updateEntity={updateMarket}
    deleteEntity={deleteMarket}
    checkCanDelete={checkCanDeleteMarket}
  />
);

export default MarketManager;