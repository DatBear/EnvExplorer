import { useEffect, useMemo, useReducer, useState } from "react";
import { Button, Col, Container, Row, Modal, Accordion, DropdownButton } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import Environment from "../Data/Environment";
import CompareParametersRequest from "../Data/Model/CompareParametersRequest";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";
import MissingParameterResponse from "../Data/Model/MissingParameterResponse";
import MissingParametersResponse from "../Data/Model/MissingParametersResponse";
import ParameterStoreService from "../Services/ParameterStoreService";
import { searchFilterMissingParameter, useSearch } from "./Contexts/SearchContext";
import { useToasts } from "./Contexts/ToastContext";
import { SearchBar } from "./SearchBar";

type MissingParametersModalProps = {
  response: MissingParametersResponse;
  selectedTemplateOptions: Record<string, string>;
  updateCompareParametersResponse: (request: CompareParametersResponse, isEditMode: boolean) => void;
}

function MissingParametersModal({ response, selectedTemplateOptions, updateCompareParametersResponse } : MissingParametersModalProps) {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);
  const [parameterCounts, setParameterCounts] = useState({ parameters: 0, filteredParameters: 0 });

  const forceUpdate = useReducer(() => ({}), {})[1];

  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);

  const { search } = useSearch();
  const { addToast, addErrorToast } = useToasts();
  
  useEffect(() => {
    setShow(true);
  }, [response]);

  useEffect(() => {
    const total = response?.parameters.length ?? 0;
    setParameterCounts({
      parameters: total,
      filteredParameters: response?.parameters?.filter(x => searchFilterMissingParameter(search, x)).length ?? total
    });
  }, [response, search]);

  const addParameter = (name: string, value: string, type: string) => {
    parameterStoreService.saveParameterValue(name, value, type).then(res => {
      response.parameters = response.parameters.filter(x => x.name !== name);
      forceUpdate();
      addToast({ message: 'Parameter added: ' + name, textColor: 'success' });
    }).catch(addErrorToast);
  }

  const edit = (parameter: MissingParameterResponse) => {
    const request : CompareParametersRequest = {
      compareByOption: response.missingByOption,
      parameterName: parameter.name,
      template: Environment.defaultTemplate,
      templateValues: parameter.parameters[0].templateValues
    };

    parameterStoreService.compareParameters(request).then(res => {
      updateCompareParametersResponse(res, true);
    });
  }

  const parameterCount = () => {
    return parameterCounts.filteredParameters + (parameterCounts.filteredParameters !== parameterCounts.parameters ? `/${parameterCounts.parameters}` : '');
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Container>
          <Row>
            <Col className="pt-2"><strong>{response.missingByValue} Missing Parameters</strong></Col>
            <Col><SearchBar /></Col>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {!response.parameters.length && <span>No missing parameters found for {response.missingByValue}.</span>}
          {!!response.parameters.length && <>
            <Row>
              <Col>
                Showing <strong>{parameterCount()}</strong> missing parameters for {response.missingByOption}: {response.missingByValue}.
              </Col>
            </Row>
            <Accordion alwaysOpen defaultActiveKey={Array.from(Array(response.parameters.length).keys()).map(x => x.toString())}>
              {response.parameters.filter(x => searchFilterMissingParameter(search, x)).map((x, idx) => {
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

