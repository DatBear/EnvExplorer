import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TemplateOption from './Components/TemplateOption';
import ParameterGroupResponse from './Data/Model/ParameterGroupResponse';
import ParameterGroup from './Components/ParameterGroup';
import ParameterValueResponse from './Data/Model/ParameterValueResponse';
import ParameterOffCanvas from './Components/ParameterOffCanvas';
import CompareParametersResponse from './Data/Model/CompareParametersResponse';
import CompareParametersModal from './Components/CompareParametersModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faDownLeftAndUpRightToCenter, faFile, faFileExport, faFileUpload, faGear, faHistory, faRefresh } from '@fortawesome/free-solid-svg-icons';
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
import ParameterHistoryModal from "./Components/ParameterHistoryModal";
import Button from "./Components/Common/Button";
import Spinner from "./Components/Spinner";
import Accordion from "./Components/Common/Accordion";
import DropdownButton, { Dropdown } from "./Components/Common/DropdownButton";
import { getThemeClass } from "./Data/Model/Theme";
import clsx from "clsx";
import UploadEnvFileModal from "./Components/UploadEnvFileModal";
import ParameterStoreUpdateEvent from "./Data/Events/ParameterStoreUpdateEvent";
import FixedProgressBar from "./Components/Common/FixedProgressBar";
import OverlayTrigger from "./Components/Common/OverlayTrigger";

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
  const [showUploadFileModal, setShowUploadFileModal] = useState(false);
  const [showFileExportModal, setShowFileExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsOffCanvas, setShowSettingsOffCanvas] = useState(false);
  const [parameterCounts, setParameterCounts] = useState({ parameters: 0, filteredParameters: 0 });

  const [parameterStoreUpdate, setParameterStoreUpdate] = useState<ParameterStoreUpdateEvent>();

  const { search } = useSearch();
  const dataFetched = useRef(false);
  const { addErrorToast } = useToasts();

  const fetchData = useCallback(() => {
    setSelectedTemplateOptions((s) => ({ ...s }));
  }, [setSelectedTemplateOptions]);

  const showError = useCallback((err: any) => {
    setHasError(true);
    addErrorToast(err);
  }, [addErrorToast]);

  const getTemplateOptions = useCallback(() => {
    ParameterStoreService.instance.__updateEnvironment();
    setHasError(false);
    setIsRefreshing(true);
    parameterStoreService.getTemplateOptions().then(data => {
      setTemplateOptions(data);
    })
      .catch(showError)
      .finally(() => setIsRefreshing(false));
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
  }, [selectedTemplateOptions, parameterStoreService, showError]);

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

  useEffect(() => {
    var updateListener = (e: ParameterStoreUpdateEvent) => {
      setParameterStoreUpdate({ ...e });
    }

    ParameterStoreService.updateEventEmitter.on(updateListener);
    return () => ParameterStoreService.updateEventEmitter.off(updateListener);
  }, []);

  const setSelectedTemplateOption = (key: string, value: string) => {
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

  let loadingPrefix = (() => {
    if (!parameterStoreUpdate) return null;
    let key = Object.keys(parameterStoreUpdate.prefixes).find(x => !parameterStoreUpdate?.prefixes[x].isComplete && parameterStoreUpdate?.prefixes[x].current > 0);
    if (!key) return null;
    return parameterStoreUpdate.prefixes[key];
  })();


  if (Object.keys(templateOptions).length === 0) {
    return (<div className={clsx("text-white min-h-screen bg-secondary-black pb-4", getThemeClass())}>
      <div className="p-3 flex flex-row gap-3">
        <div>
          <Button onClick={_ => setShowSettingsOffCanvas(true)}><FontAwesomeIcon icon={faGear} /></Button>
        </div>
        <div>
          <Button onClick={_ => getTemplateOptions()}>
            {isRefreshing ? <Spinner /> : <FontAwesomeIcon icon={faRefresh} />}
          </Button>
        </div>
      </div>
      {hasError && <div>
        <div>
          <div className="pl-3">Error loading parameters, check your settings (<FontAwesomeIcon icon={faGear} />) and try again using <FontAwesomeIcon icon={faRefresh} />.</div>
        </div>
      </div>}
      <SettingsOffCanvas show={showSettingsOffCanvas} setShow={setShowSettingsOffCanvas} />
    </div>)
  }

  return <>
    <div className={clsx('bg-secondary-black text-white min-h-screen p-4', getThemeClass())}>
      <header>
        <img src={icon} className="absolute right-3 top-3" alt="Sweet EnvExplorer logo lookin fly" />
      </header>
      <div className="pl-2 flex flex-row gap-3 items-end">
        <div className="pt-4">
          <Button onClick={_ => setShowSettingsOffCanvas(true)} title="Settings"><FontAwesomeIcon icon={faGear} /></Button>
        </div>
        {templateOptions && Object.keys(templateOptions).map((key, idx) => {
          return <TemplateOption key={idx} name={key} values={Object.values(templateOptions)[idx]} setSelection={setSelectedTemplateOption} />
        })}
      </div>
      <div className="pt-3 pl-2 flex flex-row gap-3 items-center">
        <div className="w-max">
          <Button onClick={_ => refreshAll()} title="Refresh">
            {isRefreshing ? <Spinner /> : <FontAwesomeIcon icon={faRefresh} />}
          </Button>
        </div>
        <div className="w-max">
          <Button onClick={_ => setShowCreateModal(true)} title="Add a parameter"><FontAwesomeIcon icon={faAdd} /></Button>
        </div>
        <div className="w-max">
          <Button onClick={_ => setShowFileModal(true)} title="Export to file"><FontAwesomeIcon icon={faFile} /></Button>
        </div>
        <div className="w-max">
          <Button onClick={_ => setShowUploadFileModal(true)} title="Import from file"><FontAwesomeIcon icon={faFileUpload} /></Button>
        </div>
        <div className="w-max">
          <Button onClick={_ => setShowFileExportModal(true)} title="Generate export script"><FontAwesomeIcon icon={faFileExport} /></Button>
        </div>
        <div className="w-max">
          <Button onClick={_ => setShowCompareModal(true)} title="Compare parameters"><FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} /></Button>
        </div>
        <div className="w-max">
          <Button onClick={_ => setShowHistoryModal(true)} title="History"><FontAwesomeIcon icon={faHistory} /></Button>
        </div>
        <div className="w-max flex flex-row gap-2">
          <DropdownButton title={"Find missing in"}>
            {Environment.templateOptions().map((x, idx) => <Dropdown.Item key={idx} onClick={_ => missingBy(x)}>{x}</Dropdown.Item>)}
          </DropdownButton>
        </div>
        <div className="w-max">
          <SearchBar />
        </div>
        <div className="w-max">
          <div className="pt-2">Showing <strong>{parameterCounts.filteredParameters}{parameterCounts.filteredParameters !== parameterCounts.parameters ? `/${parameterCounts.parameters}` : ''}</strong> parameters.</div>
        </div>
      </div>
      <CreateParameterModal show={showCreateModal} setShow={setShowCreateModal} templateOptions={templateOptions} selectedTemplateOptions={selectedTemplateOptions} />
      <CompareTemplatesModal show={showCompareModal} setShow={setShowCompareModal} templateOptions={templateOptions} />
      {selectedGroup && selectedGroup.name && <>
        <ParameterHistoryModal show={showHistoryModal} setShow={setShowHistoryModal} />
        <EnvFileModal show={showFileModal} setShow={setShowFileModal} templateOptions={templateOptions} selectedTemplateOptions={selectedTemplateOptions} group={selectedGroup} />
        <UploadEnvFileModal show={showUploadFileModal} setShow={setShowUploadFileModal} templateOptions={templateOptions} selectedTemplateOptions={selectedTemplateOptions} setSelectedTemplateOptions={setSelectedTemplateOptions} group={selectedGroup} />
        <FileExportModal show={showFileExportModal} setShow={setShowFileExportModal} templateOptions={templateOptions} />
        <div className="border-2 border-primary-800 bg-secondary-900 pb-4 m-2 rounded-xl"><Accordion defaultOpen={true}><ParameterGroup group={selectedGroup} updateSelectedParameter={updateSelectedParameter} /></Accordion></div>
      </>}
      {selectedGroup && !selectedGroup.name && <div className="pt-3">No parameters found for this configuration.</div>}
      {offCanvasParameter && <ParameterOffCanvas parameter={offCanvasParameter} selectedTemplateOptions={selectedTemplateOptions} updateCompareParametersResponse={updateCompareParametersResponse} refreshData={fetchData} />}
      {missingParametersResponse && <MissingParametersModal response={missingParametersResponse} selectedTemplateOptions={selectedTemplateOptions} updateCompareParametersResponse={updateCompareParametersResponse} refreshData={fetchData} />}
      {compareParametersResponse && <CompareParametersModal response={compareParametersResponse} selectedTemplateOptions={selectedTemplateOptions} editMode={compareEditMode} />}
      <SettingsOffCanvas show={showSettingsOffCanvas} setShow={setShowSettingsOffCanvas} />
    </div>
    {parameterStoreUpdate && !parameterStoreUpdate.isComplete && <div className="bg-secondary-800 fixed h-8 top-0 w-full">
      {loadingPrefix && <FixedProgressBar className="top-0" name={loadingPrefix.prefix} current={loadingPrefix.current} total={loadingPrefix.total} />}
      <FixedProgressBar className="top-4" name="Total" current={parameterStoreUpdate.parametersRetrieved} total={parameterStoreUpdate.totalParameters} />
    </div>}
  </>;
}

export default App;
