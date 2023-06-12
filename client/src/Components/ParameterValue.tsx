import React from "react";
import { searchFilterParameter, useSearch } from "./Contexts/SearchContext";
import clsx from "clsx";

type ParameterValueProps = {
  name: string;
  value: string;
  type: string;
  editAction: React.MouseEventHandler;
}

function ParameterValue({ name, value, type, editAction }: ParameterValueProps) {
  const { search } = useSearch();

  const displayValue = (value: string) => {
    var classes = clsx(
      value === "true" && "px-1 rounded-lg bg-green-500 parameter-value",
      value === "false" && "px-1 rounded-lg bg-red-500 parameter-value"
    );

    return <span className={classes}>{value}</span>
  }

  return (<>
    {searchFilterParameter(search, { name, value, type }) && <div>
      <span className="wrap" onClick={editAction}>{name}={displayValue(value)}</span>
    </div>}
  </>);
}

export default ParameterValue;