import React from "react";
import SearchContext, { useSearch } from "./Contexts/SearchContext";

type ParameterValueProps = {
  name: string;
  value: string;
  editAction: React.MouseEventHandler;
}

function ParameterValue({name, value, editAction}: ParameterValueProps) {
  const { search } = useSearch();
  
  const displayValue = (value: string) => {
    if(value === 'true') {
      return (<span className="badge rounded-pill text-bg-success">{value}</span>)
    } else if(value === 'false') {
      return (<span className="badge rounded-pill text-bg-danger">{value}</span>)
    }
    return value;
  }

  const showFromSearch = (search: string | null) => {
    return search == null || name.toLowerCase().indexOf(search) > -1 || value.toLowerCase().indexOf(search) > -1;
  }

  return (<>
    {showFromSearch(search) && <div>
      <span onClick={editAction}>{name}={displayValue(value)}</span>
    </div>}
  </>);
}

export default ParameterValue;