import React, { useEffect, useRef } from 'react';
import Select from "./Common/Select";

type TemplateOptionProps = {
  name: string;
  values: string[];
  multiple?: boolean;
  setSelection?: (key: string, value: string) => void | null;
  setMultipleSelection?: (key: string, value: string[]) => void | null;
}

function TemplateOption({ name, values, multiple: isMultiple, setSelection, setMultipleSelection }: TemplateOptionProps) {
  const isSetup = useRef(false);

  useEffect(() => {
    if (isSetup.current) return;
    isSetup.current = true;
    setSelection && setSelection(name, values[0]);
    setMultipleSelection && setMultipleSelection(name, []);
  }, [name, values, setSelection, setMultipleSelection]);

  const onSelectionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelection && setSelection(name, e.target.value);
    setMultipleSelection && setMultipleSelection(name, [...e.target.selectedOptions].map(x => x.value));
  }

  return <div className="w-max flex flex-col gap-2">
    <b>{name}</b>
    <Select name={name} onChange={(e) => onSelectionChanged(e)} multiple={isMultiple ?? false}>
      {values.map((value, idx) => <option key={idx} value={value}>{value}</option>)}
    </Select>
  </div>;
}

export default TemplateOption;