import './App.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import ParameterApiService from './Services/ParameterApiService';
import TemplateOption from './Components/TemplateOption';
import ParameterGroupResponse from './Data/Model/ParameterGroupResponse';
import ParameterGroup from './Components/ParameterGroup';
import ParameterValueResponse from './Data/Model/ParameterValueResponse';
import ParameterOffCanvas from './Components/ParameterOffCanvas';
import CompareParametersResponse from './Data/Model/CompareParametersResponse';
import CompareParametersModal from './Components/CompareParametersModal';

function App() {
  const parameterApiService = useMemo(() => new ParameterApiService(), []);

  const [templateOptions, setTemplateOptions] = useState<Record<string, string[]>>({});
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState<Record<string, string>>({});
  const [selectedGroup, setSelectedGroup] = useState<ParameterGroupResponse>();
  const [offCanvasParameter, setOffCanvasParameter] = useState<ParameterValueResponse>();
  const [compareParametersResponse, setCompareParametersResponse] = useState<CompareParametersResponse>();

  const dataFetched = useRef(false);

  useEffect(() => {
    if(dataFetched.current) return;
    dataFetched.current = true;

    parameterApiService.getTemplateOptions().then(data => {
      setTemplateOptions(data);
    });
    
  }, [parameterApiService]);

  useEffect(() => {
    if(Object.keys(selectedTemplateOptions).length === 0) return;

    parameterApiService.getGroupedParameters(null, selectedTemplateOptions).then(data => {
      setSelectedGroup(data);
    });
  }, [selectedTemplateOptions, parameterApiService]);

  const setSelectedOption = (key: string, value: string) => {
    selectedTemplateOptions[key] = value;
    setSelectedTemplateOptions({...selectedTemplateOptions});
  };

  const updateSelectedParameter = (parameter: ParameterValueResponse) => {
    setOffCanvasParameter({...parameter});
  }

  const updateCompareParametersResponse = (response: CompareParametersResponse) => {
    setCompareParametersResponse({...response});
  }

  return (
    <div className="container-fluid app">
      <header><img src="/img/icon.png" style={{position: 'absolute', right: '10px', top: '10px', zIndex: '-1' }} alt="Sweet EnvExplorer logo lookin fly" /></header>
      {templateOptions && <div className="row align-items-center">
        {templateOptions && Object.keys(templateOptions).map((key, idx) => {
          return <TemplateOption key={idx} name={key} values={Object.values(templateOptions)[idx]} setSelection={setSelectedOption} />
        })}
      </div>}
      {selectedGroup && <div className="accordion"><ParameterGroup group={selectedGroup} updateSelectedParameter={updateSelectedParameter} /></div> }
      {offCanvasParameter && <ParameterOffCanvas parameter={offCanvasParameter} selectedTemplateOptions={selectedTemplateOptions} updateCompareParametersResponse={updateCompareParametersResponse} />}
      {compareParametersResponse && <CompareParametersModal response={compareParametersResponse} selectedTemplateOptions={selectedTemplateOptions} />}
    </div>
  );
}

export default App;
