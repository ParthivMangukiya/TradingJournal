import React, { useState, useEffect } from 'react';
import { SelectPicker, DateRangePicker as RsuiteDateRangePicker } from 'rsuite';

const DateRangePicker = ({ onChange }) => {
  const [dateFilter, setDateFilter] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);

  const dateFilterOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Last Year', value: 'lastYear' },
    { label: 'Year to Date', value: 'ytd' },
    { label: 'Current Month', value: 'currentMonth' },
    { label: 'Custom Range', value: 'custom' },
  ];

  useEffect(() => {
    handleDateChange(dateFilter);
  }, []);

  const handleDateChange = (value) => {
    setDateFilter(value);
    let start = null;
    let end = null;

    switch (value) {
      case 'lastYear':
        start = new Date(new Date().getFullYear() - 1, 0, 1);
        end = new Date(new Date().getFullYear() - 1, 11, 31);
        break;
      case 'ytd':
        start = new Date(new Date().getFullYear(), 0, 1);
        end = new Date();
        break;
      case 'currentMonth':
        start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        end = new Date();
        break;
      case 'custom':
        setDateRange([null, null]);
        return;
      default:
        break;
    }

    setDateRange([start, end]);
    onChange(start, end);
  };

  const handleCustomDateChange = (range) => {
    setDateRange(range);
    if (range && range[0] && range[1]) {
      onChange(range[0], range[1]);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <SelectPicker 
        data={dateFilterOptions}
        searchable={false}
        style={{ width: 200 }}
        placeholder="Filter by Date"
        value={dateFilter}
        onChange={handleDateChange}
      />
      {dateFilter === 'custom' && (
        <RsuiteDateRangePicker 
          value={dateRange}
          onChange={handleCustomDateChange}
          style={{ width: 280 }}
        />
      )}
    </div>
  );
};

export default DateRangePicker;