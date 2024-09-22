import React from 'react';
import UploadData from '../components/UploadData/UploadData';
import { Container, Header, Content } from 'rsuite';
import './UploadDataPage.css';

function UploadDataPage() {
  return (
    <Container>
      <Header>
        <h1 className="page-title">Upload Trading Data</h1>
      </Header>
      <Content className="page-content">
        <UploadData />
      </Content>
    </Container>
  );
}

export default UploadDataPage;
