import React, { useEffect, useRef } from 'react';

interface TemplateOptionProps {
    name: string;
    values: string[];
    setSelection: (key: string, value: string) => void;
}

function TemplateOption(props: TemplateOptionProps) {
    const isSetup = useRef(false);

    useEffect(() => {
        if(isSetup.current) return;
        isSetup.current = true;
        props.setSelection(props.name, props.values[0]);
    }, []);

    const onSelectionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        props.setSelection(props.name, e.target.value);
    }

    return (<div className="col-auto">
        <b>{props.name}</b>
        <select name={props.name} onChange={(e) => onSelectionChanged(e)} className="form-control">
            {props.values.map((value, idx) => {
                return <option key={idx} value={value}>{value}</option>
            })}
        </select>
    </div>);
}

export default TemplateOption;