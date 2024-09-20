import React from 'react';
import EntityManager from './EntityManager';
import { getSetups, createSetup, updateSetup, deleteSetup } from '../../api/trades';
import { supabase } from '../../config/supabase-client';

const checkCanDeleteSetup = async (setupId) => {
  const { count, error } = await supabase
    .from('trades')
    .select('id', { count: 'exact' })
    .eq('setup_id', setupId);

  if (error) throw error;
  return count === 0;
};

const SetupManager = () => (
  <EntityManager
    entityNameProp="setup"
    getEntities={getSetups}
    createEntity={createSetup}
    updateEntity={updateSetup}
    deleteEntity={deleteSetup}
    checkCanDelete={checkCanDeleteSetup}
  />
);

export default SetupManager;
