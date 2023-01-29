import React from "react";
import SearchContext from "./Contexts/SearchContext";

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

  const showFromSearch = (search: string) => {
    return search === '' || name.toLowerCase().indexOf(search) > -1 || value.toLowerCase().indexOf(search) > -1;
  }

  return (<SearchContext.Consumer>{search => 
    showFromSearch(search) && <div>
      <span onClick={editAction}>{name}={displayValue(value)}</span>
    </div>}
  </SearchContext.Consumer>);
}

export default ParameterValue;