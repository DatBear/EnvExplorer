import { faKeyboard, faPenToSquare, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useReducer, useState } from "react";
import { Button, Col, Container, Row, Modal, Dropdown, DropdownButton, Badge } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";
import TemplatedParameterValueResponse from "../Data/Model/TemplatedParameterValueResponse";
import ParameterApiService from "../Services/ParameterApiService";
import ParameterEditor from "./ParameterEditor";

type CompareParametersModalProps = {
  response: CompareParametersResponse;
  editMode: boolean;
  selectedTemplateOptions: Record<string, string>;
}

function CompareParametersModal({ response, selectedTemplateOptions, editMode } : CompareParametersModalProps) {
  const parameterApiService = useMemo(() => new ParameterApiService(), []);
  
  const [show, setShow] = useState(true);
  const [isEditMode, setIsEditMode] = useState(editMode);
  const [showTypes, setShowTypes] = useState(false);

  const handleClose = () => setShow(false);
  const toggleIsEditMode = () => setIsEditMode(!isEditMode);
  const toggleShowTypes = () => setShowTypes(!showTypes);
  
  useEffect(() => {
    setShow(true);
    setIsEditMode(editMode);
  }, [response]);

  const save = (parameter: TemplatedParameterValueResponse, type: string | null = null) => {
    if(parameter.value === null) return;//todo toast error
    parameterApiService.saveParameterValue(parameter.name, parameter.value, type ?? parameter.type).then(res => {
      //todo toast
    });    
  }

  const onValueChanged = (template: TemplatedParameterValueResponse, value: string) => {
    template.value = value;
  }

  return (
    <Modal show={show} onHide={handleClose} size='xl' centered>
      <Modal.Header closeButton>
        <Container>
          <Row className='justify-content-md-center'>
            <Col><strong>{response.parameterName}</strong></Col>
            <Col xs='auto'>
              <Button variant={showTypes ? "success" : "danger"} size="sm" onClick={_ => toggleShowTypes()}><FontAwesomeIcon icon={faKeyboard}/></Button>&nbsp;
              <Button variant={isEditMode ? "success" : "danger"} size="sm" onClick={_ => toggleIsEditMode()}><FontAwesomeIcon icon={faPenToSquare}/></Button>
            </Col>
          </Row>
        </Container>
        
        
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>Showing {response.parameterName} in every {response.compareByOption}.</Col>
          </Row>
          <Row className='pt-3'>
            <Col>
              <table className='table table-bordered table-hover'>
                <thead>
                  <tr>
                    <th>{response.compareByOption}</th>
                    <th>Name</th>
                    <th>Value</th>
                    {isEditMode && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {response.parameters.map((x, idx) => {
                    const isMissing = !x.value;
                    const parameterTypes = response.parameters.filter(x => x.type !== null).map((x) => ({ opt: x.templateValues[response.compareByOption], type: x.type }));
                    const numParameterTypes = [...new Set(response.parameters.filter(x => x.type !== null).map(x => x.type))].length;
                    return (<tr key={idx} className={isMissing ? "text-danger" : ""}>
                      <td>{x.templateValues[response.compareByOption]}</td>
                      <td>
                        {x.name}
                        {showTypes && x.type && <><br/><Badge bg='secondary'>{x.type}</Badge></>}
                      </td>
                      <td><ParameterEditor value={x.value} isEditMode={isEditMode} onChange={v => onValueChanged(x, v)} /></td>
                      {isEditMode && <td>
                        {numParameterTypes == 1 && <Button variant="success" onClick={_ => save(x, parameterTypes[0].type)}><FontAwesomeIcon icon={faSave} size="sm" /></Button>}
                        {numParameterTypes > 1 && <Dropdown>
                          <Dropdown.Toggle size="sm" variant="success">
                            <FontAwesomeIcon icon={faSave} size="sm" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            
                            {numParameterTypes > 1 && [...new Set(parameterTypes.map(x => x.type))].map((type, idx) => {
                              return <DropdownItem key={idx} onClick={_ => save(x, type)}>Save as {type} [{parameterTypes.filter(t => t.type === type).length} {response.compareByOption}(s)]</DropdownItem>
                            })}
                          </Dropdown.Menu>
                        </Dropdown>}
                      </td>}
                    </tr>);
                  })}
                </tbody>
              </table>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CompareParametersModal;