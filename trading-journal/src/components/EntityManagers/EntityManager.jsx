import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Modal, Message, toaster } from 'rsuite';
import { useAuth } from '../../contexts/AuthContext';

const { Column, HeaderCell, Cell } = Table;

const EntityManager = ({ entityNameProp, getEntities, createEntity, updateEntity, deleteEntity, checkCanDelete }) => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [entityName, setEntityName] = useState('');
  const { user } = useAuth();

  const fetchEntities = useCallback(async () => {
    try {
      const data = await getEntities();
      setEntities(data);
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching ${entityNameProp}s:`, error);
      toaster.push(<Message type="error">{`Error fetching ${entityNameProp}s`}</Message>);
      setLoading(false);
    }
  }, [entityNameProp, getEntities]); // Remove toaster from the dependency array

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleCreate = async () => {
    try {
      await createEntity(entityName, user.id);
      setShowModal(false);
      setEntityName('');
      fetchEntities();
      toaster.push(<Message type="success">{`${entityNameProp} created successfully`}</Message>);
    } catch (error) {
      console.error(`Error creating ${entityNameProp}:`, error);
      toaster.push(<Message type="error">{`Error creating ${entityNameProp}`}</Message>);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateEntity(editingEntity.id, entityName);
      setShowModal(false);
      setEditingEntity(null);
      setEntityName('');
      fetchEntities();
      toaster.push(<Message type="success">{`${entityNameProp} updated successfully`}</Message>);
    } catch (error) {
      console.error(`Error updating ${entityNameProp}:`, error);
      toaster.push(<Message type="error">{`Error updating ${entityNameProp}`}</Message>);
    }
  };

  const handleDelete = async (id) => {
    try {
      const canDelete = await checkCanDelete(id);
      if (!canDelete) {
        toaster.push(<Message type="error">{`Cannot delete ${entityNameProp}. It is being used in trades.`}</Message>);
        return;
      }
      await deleteEntity(id);
      fetchEntities();
      toaster.push(<Message type="success">{`${entityNameProp} deleted successfully`}</Message>);
    } catch (error) {
      console.error(`Error deleting ${entityNameProp}:`, error);
      toaster.push(<Message type="error">{`Error deleting ${entityNameProp}`}</Message>);
    }
  };

  return (
    <div>
      <Button appearance="primary" onClick={() => setShowModal(true)}>Add {entityNameProp}</Button>
      <Table
        height={400}
        data={entities}
        loading={loading}
        autoHeight
      >
        <Column flexGrow={1}>
          <HeaderCell>{`${entityNameProp.charAt(0).toUpperCase() + entityNameProp.slice(1)} Name`}</HeaderCell>
          <Cell>
            {(rowData) => rowData[`${entityNameProp}_name`]}
          </Cell>
        </Column>
        <Column width={200} fixed="right">
          <HeaderCell>Action</HeaderCell>
          <Cell>
            {rowData => (
              <span>
                <Button appearance="link" onClick={() => {
                  setEditingEntity(rowData);
                  setEntityName(rowData[`${entityNameProp}_name`]);
                  setShowModal(true);
                }}>
                  Edit
                </Button>
                {' | '}
                <Button appearance="link" onClick={() => handleDelete(rowData.id)}>
                  Delete
                </Button>
              </span>
            )}
          </Cell>
        </Column>
      </Table>

      <Modal open={showModal} onClose={() => {
        setShowModal(false);
        setEditingEntity(null);
        setEntityName('');
      }}>
        <Modal.Header>
          <Modal.Title>{editingEntity ? `Edit ${entityNameProp}` : `Add ${entityNameProp}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input 
            value={entityName} 
            onChange={setEntityName} 
            placeholder={`Enter ${entityNameProp} name`} 
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => {
            setShowModal(false);
            setEditingEntity(null);
            setEntityName('');
          }} appearance="subtle">
            Cancel
          </Button>
          <Button onClick={editingEntity ? handleUpdate : handleCreate} appearance="primary">
            {editingEntity ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EntityManager;
