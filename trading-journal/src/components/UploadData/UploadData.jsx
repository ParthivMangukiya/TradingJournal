import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../../contexts/AuthContext';
import {
  createTrade,
  createBuyTransaction,
  createSellTransaction,
  createMarket,
  createSetup,
  createType,
  getMarkets,
  getSetups,
  getTypes,
  getAccounts,
  createAccount
} from '../../api/trades';
import { Button, Uploader, Message, Loader } from 'rsuite';
import { FaUpload } from 'react-icons/fa';
import './UploadData.css';

function UploadData() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const { user } = useAuth();

  const addLog = (log) => {
    setLogs(prevLogs => [...prevLogs, log]);
  };

  const handleFileChange = (fileList) => {
    setFile(fileList[0]?.blobFile || null);
    setLogs([]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMessage('');
    setLogs([]);

    try {
      addLog('File uploaded. Processing...');
      const data = await readExcelFile(file);
      const response = await uploadData(data);
      setMessage(response.message);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          addLog('Reading Excel file...');
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          addLog('Excel file read successfully. Processing data...');
          const processedData = processData(data);
          
          if (processedData.length === 0) {
            throw new Error('No valid data found in the Excel file after processing.');
          }
          
          resolve(processedData);
        } catch (error) {
          addLog(`Error processing Excel file: ${error.message}`);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        addLog(`Error reading file: ${error.message}`);
        reject(error);
      };
      reader.readAsBinaryString(file);
    });
  };

  const processData = (data) => {
    addLog('Finding header row...');
    const keyColumns = ['name', 'setup', 'type', 'market', 'kite', 'position'];
    let headerRowIndex = -1;

    for (let i = 0; i < data.length; i++) {
      const row = data[i].map(cell => String(cell).trim().toLowerCase());
      if (keyColumns.every(key => row.includes(key))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error("Could not find a valid header row in the Excel file.");
    }

    addLog(`Header row found at index: ${headerRowIndex}`);

    const headers = data[headerRowIndex].map((header, index) => {
      if (header === undefined || header === null) {
        addLog(`Warning: Undefined or null header at index ${index}. Using default name.`);
        return `column_${index}`;
      }
      return String(header).trim().toLowerCase().replace(/\s+/g, '_');
    });

    addLog(`Detected headers: ${headers.join(', ')}`);

    const processedData = data.slice(headerRowIndex + 1).map(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] !== undefined ? row[index] : null;
      });
      return rowData;
    });

    addLog(`Number of rows processed: ${processedData.length}`);

    return processedData;
  };

  const uploadData = async (data) => {
    let markets = await getMarkets();
    let setups = await getSetups();
    let types = await getTypes();
    let accounts = await getAccounts();

    let stats = {
      validRows: 0,
      skippedRows: 0,
      tradesCreated: 0,
      buyTransactionsCreated: 0,
      sellTransactionsCreated: 0,
      marketsCreated: 0,
      setupsCreated: 0,
      typesCreated: 0,
      accountsCreated: 0
    };

    for (const row of data) {
      try {
        // Skip rows where name is null or undefined without logging
        if (!row.name) {
          stats.skippedRows++;
          continue;
        }

        // Check for other required fields
        if (!row.market || !row.setup || !row.type || !row.kite) {
          addLog(`Skipping row for ${row.name} due to missing required fields`);
          stats.skippedRows++;
          continue;
        }

        stats.validRows++;

        // Find or create market
        let market = markets.find(m => m.market_name.toLowerCase() === row.market.toLowerCase());
        if (!market) {
          market = await createMarket(row.market, user.id);
          markets.push(market);
          stats.marketsCreated++;
          addLog(`Created new market: ${row.market}`);
        }

        // Find or create setup
        let setup = setups.find(s => s.setup_name.toLowerCase() === row.setup.toLowerCase());
        if (!setup) {
          setup = await createSetup(row.setup, user.id);
          setups.push(setup);
          stats.setupsCreated++;
          addLog(`Created new setup: ${row.setup}`);
        }

        // Find or create type
        let type = types.find(t => t.type_name.toLowerCase() === row.type.toLowerCase());
        if (!type) {
          type = await createType(row.type, user.id, setup.id);
          types.push(type);
          stats.typesCreated++;
          addLog(`Created new type: ${row.type}`);
        }

        // Find or create account
        let account = accounts.find(a => a.account_name.toLowerCase() === row.kite.toLowerCase());
        if (!account) {
          account = await createAccount(row.kite, user.id);
          accounts.push(account);
          stats.accountsCreated++;
          addLog(`Created new account: ${row.kite}`);
        }

        // Parse dates
        const buyDate = parseDate(row.buy_date);
        const sellDate = parseDate(row.sell_date);
        const currentDate = new Date().toISOString().split('T')[0];

        // Parse risk and stop loss
        const risk = parsePercentage(row['risk%']);
        const stopLoss = parsePercentage(row['stop_loss_%']);

        // Create trade
        const trade = await createTrade(
          buyDate || currentDate,
          account.id,
          row.name,
          setup.id,
          type.id,
          market.id,
          row.group_rank,
          row.pro_score,
          row['1w_rs'],
          row['1m_rs'],
          risk,
          user.id,
          currentDate // Creation date
        );
        stats.tradesCreated++;
        addLog(`Created trade for: ${row.name}`);

        // Create buy transaction
        await createBuyTransaction(
          trade.id,
          parseFloat(row.buy_price || '0'),
          buyDate || currentDate,
          parseFloat(row.quantity || '0'),
          parseFloat(row.initial_stop || '0'),
          stopLoss,
          parseFloat(row.buy_brok || '0'),
          user.id
        );
        stats.buyTransactionsCreated++;

        // Create sell transaction if the position is closed
        if (String(row.position).toLowerCase() === 'closed') {
          const sellPrice = typeof row.sell_price === 'string' 
            ? parseFloat(row.sell_price.replace('₹ ', '').replace(',', '') || '0')
            : parseFloat(row.sell_price || '0');

          await createSellTransaction(
            trade.id,
            sellPrice,
            sellDate || currentDate,
            parseFloat(row.quantity || '0'),
            parseFloat(row.sell_brok || '0'),
            user.id
          );
          stats.sellTransactionsCreated++;
        }
      } catch (error) {
        addLog(`Error processing row for ${row.name || 'unknown'}: ${error.message}`);
        console.error(`Row details:`, JSON.stringify(row, null, 2));
        console.error(`Error stack:`, error.stack);
      }
    }

    addLog(`Upload completed. Summary:`);
    addLog(`Valid rows: ${stats.validRows}`);
    addLog(`Skipped rows: ${stats.skippedRows}`);
    addLog(`Trades created: ${stats.tradesCreated}`);
    addLog(`Buy transactions created: ${stats.buyTransactionsCreated}`);
    addLog(`Sell transactions created: ${stats.sellTransactionsCreated}`);
    addLog(`Markets created: ${stats.marketsCreated}`);
    addLog(`Setups created: ${stats.setupsCreated}`);
    addLog(`Types created: ${stats.typesCreated}`);
    addLog(`Accounts created: ${stats.accountsCreated}`);

    return { message: `Successfully uploaded ${stats.tradesCreated} trades` };
  };

  // Helper function to parse dates
  const parseDate = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    let parsedDate;
    if (typeof dateValue === 'number') {
      // Handle Excel serial date
      parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
    } else {
      // Handle string date
      parsedDate = new Date(dateValue);
    }

    if (isNaN(parsedDate.getTime())) {
      return null;
    }

    return parsedDate.toISOString().split('T')[0];
  };

  // Helper function to parse percentages
  const parsePercentage = (percentValue) => {
    if (percentValue === null || percentValue === undefined) {
      return null;
    }
    const parsed = parseFloat(percentValue);
    if (isNaN(parsed)) {
      return null;
    }
    // If the value is already in decimal form (e.g., 0.0025), return it as is
    // Otherwise, convert from percentage to decimal (e.g., 0.25 to 0.0025)
    return parsed < 1 ? parsed : parsed / 100;
  };

  return (
    <div className="upload-page">
      <div className="upload-section">
        <div className="upload-container">
          <Uploader
            fileList={file ? [file] : []}
            autoUpload={false}
            draggable
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            onRemove={() => setFile(null)}
          >
            <div className="upload-area">
              <FaUpload size={50} />
              <p>Click or drag files to this area to upload</p>
            </div>
          </Uploader>
          <Button 
            onClick={handleUpload} 
            loading={uploading} 
            appearance="primary" 
            size="lg"
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          {uploading && <Loader content="Processing data..." />}
          {message && (
            <Message 
              type={message.includes('Error') ? 'error' : 'success'}
              className="upload-message"
            >
              {message}
            </Message>
          )}
        </div>
      </div>
      <div className="log-section">
        <div className="log-container">
          <h3>Upload Logs</h3>
          <div className="log-content">
            {logs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadData;
