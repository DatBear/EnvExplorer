import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import ParameterApiService from './Services/ParameterApiService';
import TemplateOption from './Components/TemplateOption';
import ParameterGroupResponse from './Data/Model/ParameterGroupResponse';
import ParameterGroup from './Components/ParameterGroup';
import 'bootstrap/dist/js/bootstrap.min.js';


function App() {
  const parameterApiService = useMemo<ParameterApiService>(() => new ParameterApiService(), []);

  const [templateOptions, setTemplateOptions] = useState<any>({});
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState<Map<string, string>>(new Map<string, string>());
  const [selectedGroup, setSelectedGroup] = useState<ParameterGroupResponse>();

  const dataFetched = useRef(false);

  useEffect(() => {
    if(dataFetched.current) return;
    dataFetched.current = true;

    parameterApiService.getTemplateOptions().then(data => {
      setTemplateOptions(data);
    });
    
  }, [parameterApiService]);

  useEffect(() => {
    if([...selectedTemplateOptions.keys()].length === 0) return;

    parameterApiService.getGroupedParameters(null, selectedTemplateOptions).then(data => {
      setSelectedGroup(data);
    });
  }, [selectedTemplateOptions, parameterApiService]);

  const setSelectedOption = (key: string, value: string) => {
    selectedTemplateOptions.set(key, value);
    setSelectedTemplateOptions(new Map<string, string>(selectedTemplateOptions));//eww
  };

  return (
    <div className="container-fluid">
      {templateOptions && <div className="row align-items-center">
        {templateOptions && Object.keys(templateOptions).map((key, idx) => {
          return <TemplateOption key={idx} name={key} values={Object.values(templateOptions)[idx] as string[]} setSelection={setSelectedOption} />
        })}  
      </div>}
      {selectedGroup && <div className="accordion"><ParameterGroup group={selectedGroup} /></div> }
    </div>
  );
}

export default App;
