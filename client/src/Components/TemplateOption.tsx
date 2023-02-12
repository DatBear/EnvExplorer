import React, { useEffect, useRef } from 'react';

type TemplateOptionProps = {
  name: string;
  values: string[];
  isMultiple?: boolean | null;
  setSelection?: (key: string, value: string) => void | null;
  setMultipleSelection?: (key: string, value: string[]) => void | null;
}

function TemplateOption({ name, values, isMultiple, setSelection, setMultipleSelection }: TemplateOptionProps) {
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

  return (<div className="col-auto">
    <b>{name}</b>
    <select name={name} onChange={(e) => onSelectionChanged(e)} className="form-control" multiple={isMultiple ?? false}>
      {values.map((value) => <option key={value} value={value}>{value}</option>)}
    </select>
  </div>);
}

export default TemplateOption;