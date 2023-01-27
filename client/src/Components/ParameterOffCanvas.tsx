import ParameterValueResponse from "../Data/Model/ParameterValueResponse";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboard, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from "react-bootstrap";
import ParameterApiService from "../Services/ParameterApiService";
import Environment from "../Data/Environment";
import CompareParametersRequest from "../Data/Model/CompareParametersRequest";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";

type ParameterOffCanvasProps = {
  parameter: ParameterValueResponse;
  selectedTemplateOptions: Record<string, string>;
  updateCompareParametersResponse: (request: CompareParametersResponse, isEditMode: boolean) => void;
}

function ParameterOffCanvas({ parameter, selectedTemplateOptions, updateCompareParametersResponse } : ParameterOffCanvasProps) {
  const parameterApiService = useMemo(() => new ParameterApiService(), []);

  const [recentlyCopied, setRecentlyCopied] = useState(false);
  const [recentlyCopiedEnv, setRecentlyCopiedEnv] = useState(false);
  const [name, setName] = useState(parameter.name);
  const [value, setValue] = useState(parameter.value);
  const [isEditMode, setIsEditMode] = useState(false);
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);
  
  useEffect(() => {
    setValue(parameter.value);
    setName(parameter.name);
    setIsEditMode(false);
    setShow(true);
  }, [parameter]);

  useEffect(() => {
    if(!recentlyCopied) return;
    setTimeout(() => {
      setRecentlyCopied(false);
    }, 2000);
  }, [recentlyCopied]);

  useEffect(() => {
    if(!recentlyCopiedEnv) return;
    setTimeout(() => {
      setRecentlyCopiedEnv(false);
    }, 2000);
  }, [recentlyCopiedEnv]);

  const copy = () => {
    navigator.clipboard.writeText(`${name}=${value}`);
    setRecentlyCopied(true);
  };

  const copyEnv = () => {
    let copyName = name.split('/').filter((_, idx) => idx > 2).join('__');
    navigator.clipboard.writeText(`${copyName}=${value}`);
    setRecentlyCopiedEnv(true);
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  }

  const saveValue = () => {
    parameterApiService.saveParameterValue(name, value).then(res => {
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

    parameterApiService.compareParameters(request).then(res => {
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
            <OverlayTrigger placement='top' overlay={<Tooltip id={'tooltip-copy'}>{recentlyCopied ? 'Copied!' : 'Copy name=value'}</Tooltip>}>
              <FontAwesomeIcon icon={faClipboard} onClick={_ => copy()} />
            </OverlayTrigger>
          </div>
          <div className="col-auto">
            <OverlayTrigger placement='top' overlay={<Tooltip id={'tooltip-copy-env'}>{recentlyCopiedEnv ? 'Copied!' : 'Copy local .env value'}</Tooltip>}>
              <FontAwesomeIcon icon={faClipboard} onClick={_ => copyEnv()} />
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