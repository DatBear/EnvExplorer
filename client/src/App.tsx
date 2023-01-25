import './App.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import ParameterApiService from './Services/ParameterApiService';
import TemplateOption from './Components/TemplateOption';
import ParameterGroupResponse from './Data/Model/ParameterGroupResponse';
import ParameterGroup from './Components/ParameterGroup';
import ParameterValueResponse from './Data/Model/ParameterValueResponse';
import ParameterOffCanvas from './Components/ParameterOffCanvas';

function App() {
  const parameterApiService = useMemo(() => new ParameterApiService(), []);

  const [templateOptions, setTemplateOptions] = useState<Record<string, string[]>>({});
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState(new Map<string, string>());
  const [selectedGroup, setSelectedGroup] = useState<ParameterGroupResponse>();
  const [offCanvasParameter, setOffCanvasParameter] = useState<ParameterValueResponse>();
  const [showOffCanvas, setShowOffCanvas] = useState(false);

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

  const updateSelectedParameter = (parameter: ParameterValueResponse) => {
    setOffCanvasParameter({...parameter});
  }

  return (
    <div className="container-fluid app">
      <header><img src="/img/icon.png" style={{position: 'absolute', right: '10px', top: '10px', zIndex: '-1' }} /></header>
      {templateOptions && <div className="row align-items-center">
        {templateOptions && Object.keys(templateOptions).map((key, idx) => {
          return <TemplateOption key={idx} name={key} values={Object.values(templateOptions)[idx]} setSelection={setSelectedOption} />
        })}  
      </div>}
      {selectedGroup && <div className="accordion"><ParameterGroup group={selectedGroup} updateSelectedParameter={updateSelectedParameter} /></div> }
      {offCanvasParameter && <ParameterOffCanvas parameter={offCanvasParameter} />}
    </div>
  );
}

export default App;
