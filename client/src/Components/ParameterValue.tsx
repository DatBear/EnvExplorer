import { useState } from "react";
import ParameterApiService from "../Services/ParameterApiService";

type ParameterValueProps = {
  name: string;
  value: string;
}

function ParameterValue(props: ParameterValueProps) {
  const {name, value} = props;
  
  const parameterApiService = new ParameterApiService();
  const [editMode, setEditMode] = useState<boolean>(false);

  const copy = () => {
    navigator.clipboard.writeText(`${name}=${value}`);
  };

  const envCopy = () => {
    navigator.clipboard.writeText(`${name.replaceAll('/', '__')}=${value}`)
  }

  const displayValue = (value: string) => {
    if(value === 'true') {
      return (<span className="badge rounded-pill text-bg-success">{value}</span>)
    } else if(value === 'false') {
      return (<span className="badge rounded-pill text-bg-danger">{value}</span>)
    }
    return value;
  }

  return (<div>
    {!editMode && <>{name}={displayValue(value)}</>}
  </div>);
}

export default ParameterValue;