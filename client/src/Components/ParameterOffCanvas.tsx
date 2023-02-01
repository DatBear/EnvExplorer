import ParameterValueResponse from "../Data/Model/ParameterValueResponse";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from "react-bootstrap";
import Environment from "../Data/Environment";
import CompareParametersRequest from "../Data/Model/CompareParametersRequest";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";
import { useToasts } from "./Contexts/ToastContext";
import ParameterStoreService from "../Services/ParameterStoreService";

type ParameterOffCanvasProps = {
  parameter: ParameterValueResponse;
  selectedTemplateOptions: Record<string, string>;
  updateCompareParametersResponse: (request: CompareParametersResponse, isEditMode: boolean) => void;
}

function ParameterOffCanvas({ parameter, selectedTemplateOptions, updateCompareParametersResponse } : ParameterOffCanvasProps) {
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
      if(res.name !== undefined && res.value !== undefined) {
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
    const request : CompareParametersRequest = {
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
        <div className="row">
          <div className="col-auto">
            <OverlayTrigger placement='top' overlay={<Tooltip id={'tooltip-copy'}>Copy name=value</Tooltip>}>
              <FontAwesomeIcon icon={faCopy} onClick={_ => copy()} />
            </OverlayTrigger>
          </div>
          <div className="col-auto">
            <OverlayTrigger placement='top' overlay={<Tooltip id={'tooltip-copy-env'}>Copy local .env value</Tooltip>}>
              <FontAwesomeIcon icon={faCopy} onClick={_ => copyEnv()} />
            </OverlayTrigger>
          </div>
          <div className="col-auto">
            <OverlayTrigger placement='top' overlay={<Tooltip id={'tooltip-edit'}>Edit</Tooltip>}>
              <FontAwesomeIcon icon={faPenToSquare} onClick={_ => toggleEditMode()} />
            </OverlayTrigger>
          </div>
          <div className="col-auto">
            <DropdownButton title="Compare">
              {Environment.templateOptions().map((x, idx) => <Dropdown.Item key={idx} onClick={_ => compareBy(x, false)}>{x}(s)</Dropdown.Item>)}
            </DropdownButton>
          </div>
          <div className="col-auto">
            <DropdownButton title="Edit">
              {Environment.templateOptions().map((x, idx) => <Dropdown.Item key={idx} onClick={_ => compareBy(x, true)}>{x}(s)</Dropdown.Item>)}
            </DropdownButton>
          </div>
        </div>
        <div className="row pt-1">
          <div className="col">
            Value:
          </div>
        </div>
        {!isEditMode && <div className="row pt-1">
          <div className="col-sm">
            {value}
          </div>
        </div>}
        {isEditMode && <>
          <div className="row pt-1">
            <div className="col">
              {value.length <= 25 && <input type="text" value={value} onChange={e => setValue(e.target.value)} className="form-control" />}
              {value.length > 25 && <textarea value={value} onChange={e => setValue(e.target.value)} className="form-control" rows={value.length/40} />}
            </div>
          </div>
          <div className="row pt-2">
            <div className="col">
              <button onClick={_ => cancelValueEdit()} className="btn btn-danger form-control">Cancel</button>
            </div>
            <div className="col">
              <button onClick={_ => saveValue()} className="btn btn-success form-control">Save</button>
            </div>
          </div>
        </>}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default ParameterOffCanvas;