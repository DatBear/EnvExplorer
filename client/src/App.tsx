import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TemplateOption from './Components/TemplateOption';
import ParameterGroupResponse from './Data/Model/ParameterGroupResponse';
import ParameterGroup from './Components/ParameterGroup';
import ParameterValueResponse from './Data/Model/ParameterValueResponse';
import ParameterOffCanvas from './Components/ParameterOffCanvas';
import CompareParametersResponse from './Data/Model/CompareParametersResponse';
import CompareParametersModal from './Components/CompareParametersModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faDownLeftAndUpRightToCenter, faFile, faFileExport, faGear, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Accordion, Button, Col, Dropdown, DropdownButton, Row, Spinner } from 'react-bootstrap';
import Environment from './Data/Environment';
import MissingParametersRequest from './Data/Model/MissingParametersRequest';
import MissingParametersResponse from './Data/Model/MissingParametersResponse';
import MissingParametersModal from './Components/MissingParametersModal';
import EnvFileModal from './Components/EnvFileModal';
import CreateParameterModal from './Components/CreateParameterModal';
import FileExportModal from './Components/ExportFilesModal';
import { SearchBar } from './Components/SearchBar';
import { useToasts } from './Components/Contexts/ToastContext';
import icon from './Images/icon.png';
import ParameterStoreService from './Services/ParameterStoreService';
import SettingsOffCanvas from './Components/SettingsOffCanvas';
import { searchFilterParameter, useSearch } from './Components/Contexts/SearchContext';
import CompareTemplatesModal from './Components/CompareTemplatesModal';
import './App.css';
import 'bootstrap/dist/js/bootstrap.min.js';

function App() {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [templateOptions, setTemplateOptions] = useState<Record<string, string[]>>({});
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState<Record<string, string>>({});
  const [selectedGroup, setSelectedGroup] = useState<ParameterGroupResponse>();
  const [offCanvasParameter, setOffCanvasParameter] = useState<ParameterValueResponse>();
  const [compareParametersResponse, setCompareParametersResponse] = useState<CompareParametersResponse>();
  const [compareEditMode, setCompareEditMode] = useState(false);
  const [missingParametersResponse, setMissingParametersResponse] = useState<MissingParametersResponse>();
  const [showFileModal, setShowFileModal] = useState(false);
  const [showFileExportModal, setShowFileExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showSettingsOffCanvas, setShowSettingsOffCanvas] = useState(false);
  const [parameterCounts, setParameterCounts] = useState({ parameters: 0, filteredParameters: 0 });

  const { search } = useSearch();
  const dataFetched = useRef(false);
  const { addErrorToast } = useToasts();

  const fetchData = useCallback(() => {
    setSelectedTemplateOptions((s) => ({ ...s }));
  }, []);

  const showError = useCallback((err: any) => {
    setHasError(true);
    setIsRefreshing(false);
    addErrorToast(err);
  }, [addErrorToast]);

  const getTemplateOptions = useCallback(() => {
    ParameterStoreService.instance.__updateEnvironment();
    setHasError(false);
    setIsRefreshing(true);
    parameterStoreService.getTemplateOptions().then(data => {
      setIsRefreshing(false);
      setTemplateOptions(data);
    }).catch(showError);
  }, [parameterStoreService, showError]);

  useEffect(() => {
    if (dataFetched.current) return;
    dataFetched.current = true;
    if (Environment.awsAccessKeyId && Environment.awsAccessKeySecret) {
      getTemplateOptions();
    } else {
      setHasError(true);
    }
  }, [parameterStoreService, showError, getTemplateOptions]);

  useEffect(() => {
    if (Object.keys(selectedTemplateOptions).length === 0) return;
    setIsRefreshing(true);
    setHasError(false);
    parameterStoreService.getParameterGroup(selectedTemplateOptions).then(data => {
      setIsRefreshing(false);
      setSelectedGroup(data);
    }).catch(showError);
  }, [selectedTemplateOptions, parameterStoreService]);

  useEffect(() => {
    if (showCreateModal) return;
    fetchData();
  }, [showCreateModal, fetchData]);

  useEffect(() => {
    const total = selectedGroup?.total ?? 0;
    setParameterCounts({
      parameters: total,
      filteredParameters: selectedGroup?.allParameters?.filter(x => searchFilterParameter(search, x)).length ?? total
    });
  }, [selectedGroup, search]);

  const setSelectedOption = (key: string, value: string) => {
    selectedTemplateOptions[key] = value;
    setSelectedTemplateOptions({ ...selectedTemplateOptions });
  };

  const updateSelectedParameter = (parameter: ParameterValueResponse) => {
    setOffCanvasParameter({ ...parameter });
  };

  const updateCompareParametersResponse = (response: CompareParametersResponse, isEditMode: boolean) => {
    setCompareParametersResponse({ ...response });
    setCompareEditMode(isEditMode);
  };

  const refreshAll = () => {
    setIsRefreshing(true);
    setHasError(false);
    parameterStoreService.refreshCache().then(() => {
      parameterStoreService.getTemplateOptions().then(data => {
        setIsRefreshing(false);
        setTemplateOptions(data);
        setSelectedTemplateOptions({ ...selectedTemplateOptions });
      }).catch(showError);
    }).catch(showError);
  };

  const missingBy = (option: string) => {
    const request: MissingParametersRequest = {
      template: Environment.defaultTemplate,
      templateValues: selectedTemplateOptions,
      missingByOption: option
    };
    parameterStoreService.missingParameters(request).then(res => {
      setMissingParametersResponse(res);
    });
  };

  const groupAccordions = (group: ParameterGroupResponse): Number => {
    return group.children.filter(x => x.parameters.length > 0).length > 0 ? group.children.length : groupAccordions(group.children[0]);
  };

  if (Object.keys(templateOptions).length === 0) {
    return (<div className="container-fluid app">
      <Row className="m-3">
        <Col xs="auto">
          <Button size="sm" onClick={_ => setShowSettingsOffCanvas(true)}><FontAwesomeIcon icon={faGear} /></Button>
        </Col>
        <Col xs="auto">
          <Button variant="success" size="sm" onClick={_ => getTemplateOptions()}>
            {isRefreshing ? <Spinner animation="border" role="status" size="sm">
              <span className="visually-hidden">Loading...</span>
            </Spinner> : <FontAwesomeIcon icon={faRefresh} />}
          </Button>
        </Col>
      </Row>
      {hasError && <Row>
        <Col xs="12">
          <div>Error loading parameters, check your settings and try again using <FontAwesomeIcon icon={faRefresh} />.</div>
        </Col>
      </Row>}
      <SettingsOffCanvas show={showSettingsOffCanvas} setShow={setShowSettingsOffCanvas} />
    </div>)
  }

  return (
    <div className="container-fluid app">
      <header>
        <img src={icon} className="rounded" style={{ position: 'absolute', right: '10px', top: '10px', zIndex: '-1' }} alt="Sweet EnvExplorer logo lookin fly" />
      </header>
      <Row className="ps-2">
        <div className="col-auto pt-4">
          <Button size="sm" onClick={_ => setShowSettingsOffCanvas(true)}><FontAwesomeIcon icon={faGear} /></Button>
        </div>
        {templateOptions && Object.keys(templateOptions).map((key, idx) => {
          return <TemplateOption key={idx} name={key} values={Object.values(templateOptions)[idx]} setSelection={setSelectedOption} />
        })}
      </Row>
      <Row className="pt-3 ps-2">
        <div className="col-auto">
          <Button variant="success" size="sm" onClick={_ => refreshAll()}>
            {isRefreshing ? <Spinner animation="border" role="status" size="sm">
              <span className="visually-hidden">Loading...</span>
            </Spinner> : <FontAwesomeIcon icon={faRefresh} />}
          </Button>
        </div>
        <div className="col-auto">
          <DropdownButton title="Find missing in" size="sm">
            {Environment.templateOptions().map((x, idx) => <Dropdown.Item key={idx} onClick={_ => missingBy(x)}>{x}</Dropdown.Item>)}
          </DropdownButton>
        </div>
        <div className="col-auto">
          <Button size="sm" variant="success" onClick={_ => setShowCreateModal(true)}><FontAwesomeIcon icon={faAdd} /></Button>
        </div>
        <div className="col-auto">
          <Button size="sm" onClick={_ => setShowFileModal(true)}><FontAwesomeIcon icon={faFile} /></Button>
        </div>
        <div className="col-auto">
          <Button size="sm" onClick={_ => setShowFileExportModal(true)}><FontAwesomeIcon icon={faFileExport} /></Button>
        </div>

        <div className="col-auto">
          <Button size="sm" onClick={_ => setShowCompareModal(true)}><FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} /></Button>
        </div>
        <div className="col-auto">
          <SearchBar />
        </div>
        <div className="col-auto">
          <div className="pt-2">Showing <strong>{parameterCounts.filteredParameters}{parameterCounts.filteredParameters !== parameterCounts.parameters ? `/${parameterCounts.parameters}` : ''}</strong> parameters.</div>
        </div>
      </Row>
      <CreateParameterModal show={showCreateModal} setShow={setShowCreateModal} templateOptions={templateOptions} selectedTemplateOptions={selectedTemplateOptions} />
      <CompareTemplatesModal show={showCompareModal} setShow={setShowCompareModal} templateOptions={templateOptions} />
      {selectedGroup && selectedGroup.name && <EnvFileModal show={showFileModal} setShow={setShowFileModal} templateOptions={templateOptions} selectedTemplateOptions={selectedTemplateOptions} group={selectedGroup} />}
      {selectedGroup && selectedGroup.name && <FileExportModal show={showFileExportModal} setShow={setShowFileExportModal} templateOptions={templateOptions} />}
      {selectedGroup && selectedGroup.name && <Accordion alwaysOpen defaultActiveKey={Array.from(Array(groupAccordions(selectedGroup)).keys()).map(x => x.toString())}><ParameterGroup group={selectedGroup} updateSelectedParameter={updateSelectedParameter} eventKey="0" /></Accordion>}
      {selectedGroup && !selectedGroup.name && <div className="pt-3">No parameters found for this configuration.</div>}
      {offCanvasParameter && <ParameterOffCanvas parameter={offCanvasParameter} selectedTemplateOptions={selectedTemplateOptions} updateCompareParametersResponse={updateCompareParametersResponse} />}
      {missingParametersResponse && <MissingParametersModal response={missingParametersResponse} selectedTemplateOptions={selectedTemplateOptions} updateCompareParametersResponse={updateCompareParametersResponse} />}
      {compareParametersResponse && <CompareParametersModal response={compareParametersResponse} selectedTemplateOptions={selectedTemplateOptions} editMode={compareEditMode} />}
      <SettingsOffCanvas show={showSettingsOffCanvas} setShow={setShowSettingsOffCanvas} />
    </div>
  );
}

export default App;
