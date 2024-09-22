import React, { useState } from 'react';
import { DateRangePicker } from 'rsuite';

const MonthRangePicker = ({ onChange }) => {
  const [value, setValue] = useState([null, null]);

  const handleChange = (newValue) => {
    setValue(newValue);
    if (onChange) {
      if (Array.isArray(newValue) && newValue.length === 2 && newValue[0] && newValue[1]) {
        onChange(newValue[0], newValue[1]);
      } else {
        onChange(null, null);
      }
    }
  };

  return (
    <DateRangePicker
      format="yyyy-MM"
      placeholder="Select month range"
      value={value}
      onChange={handleChange}
      ranges={[]}
    />
  );
};

export default MonthRangePicker;