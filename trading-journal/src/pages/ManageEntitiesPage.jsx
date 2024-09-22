import React, { useState } from 'react';
import { Tabs, Panel } from 'rsuite';
import SetupManager from '../components/EntityManagers/SetupManager';
import MarketManager from '../components/EntityManagers/MarketManager';
import TypeManager from '../components/EntityManagers/TypeManager';
import AccountManager from '../components/EntityManagers/AccountManager';

const ManageEntitiesPage = () => {
  const [activeKey, setActiveKey] = useState('setup');

  const handleSelect = (eventKey) => {
    setActiveKey(eventKey);
  };

  return (
    <Panel header="Manage Entities" bordered>
      <Tabs activeKey={activeKey} onSelect={handleSelect} defaultActiveKey="setup">
        <Tabs.Tab eventKey="setup" title="Setup">
          <SetupManager />
        </Tabs.Tab>
        <Tabs.Tab eventKey="market" title="Market">
          <MarketManager />
        </Tabs.Tab>
        <Tabs.Tab eventKey="type" title="Type">
          <TypeManager />
        </Tabs.Tab>
        <Tabs.Tab eventKey="account" title="Account">
          <AccountManager />
        </Tabs.Tab>
      </Tabs>
    </Panel>
  );
};

export default ManageEntitiesPage;
