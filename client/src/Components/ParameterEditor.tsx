import { useEffect, useState } from "react";

type ParameterEditorProps = {
  value: string | null;
  isEditMode: boolean;
  onChange: (value: string) => void;
}

function ParameterEditor({ value, isEditMode, onChange: onChangeProp } : ParameterEditorProps) {
  const [stateValue, setStateValue] = useState(value ?? '');

  useEffect(() => {
    setStateValue(value ?? '');
  }, [value]);

  useEffect(() => {
    onChangeProp(stateValue);
  }, [stateValue, onChangeProp])

  return (<>
    {isEditMode && <>
        {stateValue.length <= 25 && <input type="text" value={(stateValue ?? '')} onChange={e => setStateValue(e.target.value)} className="form-control" />}
        {stateValue.length > 25 && <textarea value={stateValue} onChange={e => setStateValue(e.target.value)} className="form-control" rows={Math.ceil(stateValue.length/35)} />}
    </>}
    {!isEditMode && <span className="parameter-value">{stateValue}</span>}
    </>);
}

export default ParameterEditor;