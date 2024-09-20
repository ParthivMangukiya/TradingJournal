import React from 'react';
import EntityManager from './EntityManager';
import { getTypes, createType, updateType, deleteType } from '../../api/trades';
import { supabase } from '../../config/supabase-client';

const checkCanDeleteType = async (typeId) => {
  const { count, error } = await supabase
    .from('trades')
    .select('id', { count: 'exact' })
    .eq('type_id', typeId);

  if (error) throw error;
  return count === 0;
};

const TypeManager = () => (
  <EntityManager
    entityNameProp="type"
    getEntities={getTypes}
    createEntity={createType}
    updateEntity={updateType}
    deleteEntity={deleteType}
    checkCanDelete={checkCanDeleteType}
  />
);

export default TypeManager;
