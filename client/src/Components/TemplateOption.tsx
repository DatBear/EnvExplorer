import React, { useEffect, useRef } from 'react';

type TemplateOptionProps = {
    name: string;
    values: string[];
    setSelection: (key: string, value: string) => void;
}

function TemplateOption(props: TemplateOptionProps) {
  const {name, values, setSelection} = props;
  const isSetup = useRef(false);
  

  useEffect(() => {
    if(isSetup.current) return;
    isSetup.current = true;

    setSelection(name, values[0]);
  }, []);

  const onSelectionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelection(name, e.target.value);
  }

  return (<div className="col-auto">
    <b>{name}</b>
    <select name={name} onChange={(e) => onSelectionChanged(e)} className="form-control">
      {values.map((value, idx) => <option key={idx} value={value}>{value}</option>)}
    </select>
  </div>);
}

export default TemplateOption;