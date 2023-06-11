import ParameterValueResponse from "../Data/Model/ParameterValueResponse";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import Environment from "../Data/Environment";
import CompareParametersRequest from "../Data/Model/CompareParametersRequest";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";
import { useToasts } from "./Contexts/ToastContext";
import ParameterStoreService from "../Services/ParameterStoreService";
import ParameterEditor from "./ParameterEditor";
import Offcanvas from "./Common/Offcanvas";
import Button from "./Common/Button";
import DropdownButton, { Dropdown } from "./Common/DropdownButton";
import OverlayTrigger from "./Common/OverlayTrigger";

type ParameterOffCanvasProps = {
  parameter: ParameterValueResponse;
  selectedTemplateOptions: Record<string, string>;
  updateCompareParametersResponse: (request: CompareParametersResponse, isEditMode: boolean) => void;
}

function ParameterOffCanvas({ parameter, selectedTemplateOptions, updateCompareParametersResponse }: ParameterOffCanvasProps) {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);

  const [name, setName] = useState(parameter.name);
  const [value, setValue] = useState(parameter.value);
  const [isEditMode, setIsEditMode] = useState(false);
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);

  const { addToast } = useToasts();

  useEffect(() => {
    setValue(parameter.value);
    setName(parameter.name);
    setIsEditMode(false);
    setShow(true);
  }, [parameter]);

  const copy = () => {
    navigator.clipboard.writeText(`${name}=${value}`);
    addToast({ message: 'Parameter copied to clipboard!', textColor: 'success' });
  };

  const copyEnv = () => {
    navigator.clipboard.writeText(Environment.getEnvFileParameter(name, value));
    addToast({ message: 'Parameter copied to clipboard!', textColor: 'success' });
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  }

  const saveValue = () => {
    parameterStoreService.saveParameterValue(name, value, parameter.type).then(res => {
      if (res.name !== undefined && res.value !== undefined) {
        setName(res.name);
        setValue(res.value);
      }
      setIsEditMode(false);
    });
  }

  const cancelValueEdit = () => {
    setValue(parameter.value);
    setIsEditMode(false);
  }

  const compareBy = (option: string, isEditMode: boolean) => {
    const request: CompareParametersRequest = {
      template: Environment.defaultTemplate,
      templateValues: selectedTemplateOptions,
      compareByOption: option,
      parameterName: name
    };

    parameterStoreService.compareParameters(request).then(res => {
      updateCompareParametersResponse(res, isEditMode);
    });
  }

  return (
    <Offcanvas show={show} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{parameter.name}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-3 items-center">
            <OverlayTrigger placement='top' overlay={<>Copy name=value</>}>
              <FontAwesomeIcon icon={faCopy} onClick={_ => copy()} />
            </OverlayTrigger>
            <OverlayTrigger placement='top' overlay={<>Copy local .env value</>}>
              <FontAwesomeIcon icon={faCopy} onClick={_ => copyEnv()} />
            </OverlayTrigger>
            <OverlayTrigger placement='top' overlay={<>Edit</>}>
              <FontAwesomeIcon icon={faPenToSquare} onClick={_ => toggleEditMode()} />
            </OverlayTrigger>
            <DropdownButton title="Compare">
              {Environment.templateOptions().map((x, idx) => <Dropdown.Item key={idx} onClick={_ => compareBy(x, false)}>{x}(s)</Dropdown.Item>)}
            </DropdownButton>
            <DropdownButton title="Edit">
              {Environment.templateOptions().map((x, idx) => <Dropdown.Item key={idx} onClick={_ => compareBy(x, true)}>{x}(s)</Dropdown.Item>)}
            </DropdownButton>
          </div>
          <span className="pt-3">Value:</span>
          <div className="pt-1">
            <ParameterEditor value={value} isEditMode={isEditMode} onChange={v => setValue(v)} />
          </div>
          {isEditMode && <>
            <div className="flex flex-row gap-3 pt-2">
              <Button onClick={_ => cancelValueEdit()}>Cancel</Button>
              <Button onClick={_ => saveValue()}>Save</Button>
            </div>
          </>}
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default ParameterOffCanvas;