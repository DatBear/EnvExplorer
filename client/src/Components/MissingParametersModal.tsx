import { useEffect, useMemo, useReducer, useState } from "react";
import { Button, Col, Container, Row, Modal, Accordion, DropdownButton } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import Environment from "../Data/Environment";
import CompareParametersRequest from "../Data/Model/CompareParametersRequest";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";
import MissingParameterResponse from "../Data/Model/MissingParameterResponse";
import MissingParametersResponse from "../Data/Model/MissingParametersResponse";
import ParameterApiService from "../Services/ParameterApiService";
import { useSearch } from "./Contexts/SearchContext";
import { SearchBar } from "./SearchBar";

type MissingParametersModalProps = {
  response: MissingParametersResponse;
  selectedTemplateOptions: Record<string, string>;
  updateCompareParametersResponse: (request: CompareParametersResponse, isEditMode: boolean) => void;
}

function MissingParametersModal({ response, selectedTemplateOptions, updateCompareParametersResponse } : MissingParametersModalProps) {
  const parameterApiService = useMemo(() => new ParameterApiService(), []);

  const forceUpdate = useReducer(() => ({}), {})[1];

  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);

  const { search } = useSearch();
  
  useEffect(() => {
    setShow(true);
  }, [response]);

  const addParameter = (name: string, value: string, type: string) => {
    parameterApiService.saveParameterValue(name, value, type).then(res => {
      response.parameters = response.parameters.filter(x => x.name !== name);
      forceUpdate();
      //todo toast success?
    });
  }

  const edit = (parameter: MissingParameterResponse) => {
    const request : CompareParametersRequest = {
      compareByOption: response.missingByOption,
      parameterName: parameter.name,
      template: Environment.defaultTemplate,
      templateValues: parameter.parameters[0].templateValues
    };
    
    parameterApiService.compareParameters(request).then(res => {
      updateCompareParametersResponse(res, true);
    });
  }

  const showFromSearch = (param: MissingParameterResponse, search: string) => {
    return search == '' || param.name.indexOf(search) >= 0 || param.parameters.find(x => x.name.indexOf(search) >= 0 || x.value!.indexOf(search) >= 0);
  }

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Container>
          <Row>
            <Col><strong>{response.missingByValue} Missing Parameters</strong></Col>
            <Col xs="auto"><SearchBar /></Col>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {!response.parameters.length && <span>No missing parameters found for {response.missingByValue}.</span>}
          {!!response.parameters.length && <>
            <Row>
              <Col>Showing missing parameters for {response.missingByOption}: {response.missingByValue}.</Col>
            </Row>
            <Accordion alwaysOpen defaultActiveKey={Array.from(Array(response.parameters.length).keys()).map(x => x.toString())}>
              {response.parameters.filter(x => showFromSearch(x, search)).map((x, idx) => {
                return (
                  <Accordion.Item key={idx} eventKey={idx.toString()}>
                    <Accordion.Header>{x.name}</Accordion.Header>
                    <Accordion.Body>
                      <Container>
                        <Row>
                          <Col>
                            <table className="table table-bordered table-dark table-striped table-hover">
                              <thead>
                                <tr>
                                  <th>{response.missingByOption}</th>
                                  <th>Name</th>
                                  <th>Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {x.parameters.map((x, idx) => {
                                  return (<tr key={idx}>
                                    <td>{x.templateValues[response.missingByOption]}</td>
                                    <td>{x.name}</td>
                                    <td>{x.value}</td>
                                  </tr>);
                                })}
                              </tbody>
                            </table>
                          </Col>
                        </Row>
                        <Row>
                          <Col xs="auto">
                            <DropdownButton title={("Copy from ")}>
                              {x.parameters.map((p, idx) => {
                                return (<DropdownItem key={idx} onClick={_ => addParameter(x.name, p.value!, p.type!)}>{p.templateValues[response.missingByOption]}</DropdownItem>)
                              })}
                            </DropdownButton>
                          </Col>
                          <Col xs="auto">
                            <Button onClick={_ => edit(x)}>{`Edit all`}</Button>
                          </Col>
                        </Row>
                      </Container>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </>}
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

export default MissingParametersModal;

