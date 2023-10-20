import { useEffect, useState } from "react";
import Input from "./Common/Input";
import TextArea from "./Common/TextArea";

type ParameterEditorProps = {
  value: string | null;
  isEditMode: boolean;
  onChange: (value: string) => void;
}

function ParameterEditor({ value, isEditMode, onChange }: ParameterEditorProps) {
  const [stateValue, setStateValue] = useState(value ?? '');

  useEffect(() => {
    setStateValue(value ?? '');
  }, [value]);

  useEffect(() => {
    onChange(stateValue);
  }, [stateValue])

  return <>
    {isEditMode && <>
      {stateValue.length <= 25 && <Input type="text" value={(stateValue ?? '')} onChange={e => setStateValue(e.target.value)} />}
      {stateValue.length > 25 && <TextArea value={stateValue} onChange={e => setStateValue(e.target.value)} rows={Math.ceil(stateValue.length / 35)} />}
    </>}
    {!isEditMode && <span className="parameter-value wrap">{stateValue}</span>}
  </>
}

export default ParameterEditor;