import React from 'react';
import EntityManager from './EntityManager';
import { getTypes, createType, updateType, deleteType, getSetups } from '../../api/trades';
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
    createEntity={(name, userId, setupId) => createType(name, userId, setupId)}
    updateEntity={(id, name, setupId) => updateType(id, name, setupId)}
    deleteEntity={deleteType}
    checkCanDelete={checkCanDeleteType}
    relatedEntity="setup"
    getRelatedEntities={getSetups}
  />
);

export default TypeManager;
