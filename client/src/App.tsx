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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import Environment from './Data/Environment';
import MissingParametersRequest from './Data/Model/MissingParametersRequest';
import MissingParametersResponse from './Data/Model/MissingParametersResponse';
import MissingParametersModal from './Components/MissingParametersModal';

function App() {
  const parameterApiService = useMemo(() => new ParameterApiService(), []);

  const [templateOptions, setTemplateOptions] = useState<Record<string, string[]>>({});
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState<Record<string, string>>({});
  const [selectedGroup, setSelectedGroup] = useState<ParameterGroupResponse>();
  const [offCanvasParameter, setOffCanvasParameter] = useState<ParameterValueResponse>();
  const [compareParametersResponse, setCompareParametersResponse] = useState<CompareParametersResponse>();
  const [missingParametersResponse, setMissingParametersResponse] = useState<MissingParametersResponse>();

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
  };

  const updateCompareParametersResponse = (response: CompareParametersResponse) => {
    setCompareParametersResponse({...response});
  };

  const refreshAll = () => {
    parameterApiService.refreshAllParameters().then(() => {
      parameterApiService.getTemplateOptions().then(data => {
        setTemplateOptions(data);
        setSelectedTemplateOptions({...selectedTemplateOptions});
      });
    });
  };

  const missingBy = (option: string) => {
    const request : MissingParametersRequest = {
      template: Environment.defaultTemplate,
      templateValues: selectedTemplateOptions,
      missingByOption: option
    };
    parameterApiService.missingParameters(request).then(res => {
      setMissingParametersResponse(res);
    });
  }

  return (
    <div className="container-fluid app">
      <header><img src="/img/icon.png" style={{position: 'absolute', right: '10px', top: '10px', zIndex: '-1' }} alt="Sweet EnvExplorer logo lookin fly" /></header>
      {templateOptions && <div className="row align-items-center">
        {templateOptions && Object.keys(templateOptions).map((key, idx) => {
          return <TemplateOption key={idx} name={key} values={Object.values(templateOptions)[idx]} setSelection={setSelectedOption} />
        })}
        <div className="col-auto pt-4">
          <button type="button" className="btn btn-sm btn-success" onClick={_ => refreshAll()}>
            <FontAwesomeIcon icon={faRefresh} />
          </button>
        </div>
        <div className="col-auto">
          <DropdownButton title="Find missing in">
            {Environment.templateOptions().map((x, idx) => <Dropdown.Item key={idx} onClick={_ => missingBy(x)}>{x}</Dropdown.Item>)}
          </DropdownButton>
        </div>
      </div>}
      {selectedGroup && <div className="accordion"><ParameterGroup group={selectedGroup} updateSelectedParameter={updateSelectedParameter} /></div> }
      {offCanvasParameter && <ParameterOffCanvas parameter={offCanvasParameter} selectedTemplateOptions={selectedTemplateOptions} updateCompareParametersResponse={updateCompareParametersResponse} />}
      {compareParametersResponse && <CompareParametersModal response={compareParametersResponse} selectedTemplateOptions={selectedTemplateOptions} />}
      {missingParametersResponse && <MissingParametersModal response={missingParametersResponse} selectedTemplateOptions={selectedTemplateOptions} />}
    </div>
  );
}

export default App;
