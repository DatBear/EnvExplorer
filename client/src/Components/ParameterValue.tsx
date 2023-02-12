import React from "react";
import { searchFilterParameter, useSearch } from "./Contexts/SearchContext";

type ParameterValueProps = {
  name: string;
  value: string;
  type: string;
  editAction: React.MouseEventHandler;
}

function ParameterValue({ name, value, type, editAction }: ParameterValueProps) {
  const { search } = useSearch();

  const displayValue = (value: string) => {
    if (value === 'true') {
      return (<span className="badge rounded-pill text-bg-success parameter-value">{value}</span>)
    } else if (value === 'false') {
      return (<span className="badge rounded-pill text-bg-danger parameter-value">{value}</span>)
    }
    return value;
  }

  return (<>
    {searchFilterParameter(search, { name, value, type }) && <div>
      <span onClick={editAction}>{name}={displayValue(value)}</span>
    </div>}
  </>);
}

export default ParameterValue;