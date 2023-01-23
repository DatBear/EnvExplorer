import { useState } from "react";
import ParameterApiService from "../Services/ParameterApiService";

interface ParameterValueProps {
  name: string;
  value: string;
}

function ParameterValue(props: ParameterValueProps) {
  const parameterApiService = new ParameterApiService();
  const [editMode, setEditMode] = useState<boolean>(false);

  const copy = () => {
    navigator.clipboard.writeText(`${props.name}=${props.value}`);
  };

  const envCopy = () => {
    navigator.clipboard.writeText(`${props.name.replaceAll('/', '__')}=${props.value}`)
  }

  const displayValue = (value: string) => {
    if(value === 'true') {
      return (<span className="badge rounded-pill text-bg-success">{value}</span>)
    } else if(value === 'false') {
      return (<span className="badge rounded-pill text-bg-danger">{value}</span>)
    }
    return (<>{value}</>)
  }

  return (<div>
    {!editMode && <>{props.name}={displayValue(props.value)}</>}
  </div>);
}

export default ParameterValue;