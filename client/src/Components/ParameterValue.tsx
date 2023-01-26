import React from "react";

type ParameterValueProps = {
  name: string;
  value: string;
  editAction: React.MouseEventHandler;
}

function ParameterValue({name, value, editAction}: ParameterValueProps) {
  const displayValue = (value: string) => {
    if(value === 'true') {
      return (<span className="badge rounded-pill text-bg-success">{value}</span>)
    } else if(value === 'false') {
      return (<span className="badge rounded-pill text-bg-danger">{value}</span>)
    }
    return value;
  }

  return (<div>
    <span onClick={editAction}>{name}={displayValue(value)}</span>
  </div>);
}

export default ParameterValue;