import React from 'react';
import { Dropdown } from 'semantic-ui-react';

const style = {
  pointerEvents: `visible`,
  paddingLeft: `5em`,
};

const PeriodPrompt = ({ handlePeriodChange, period, periods }) => {
  const periodsObj = periods.map(period => {
    return { 
      text: period, 
      value: period 
    };
  });

  return (
    <div className="prompt">
      Over the past
      {' '}
      <Dropdown inline
        onChange={handlePeriodChange} 
        value={period} 
        options={periodsObj} />
    </div>
  )
}; 

export default PeriodPrompt;
