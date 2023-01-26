import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Modal, Accordion } from "react-bootstrap";
import MissingParametersResponse from "../Data/Model/MissingParametersResponse";

type MissingParametersModalProps = {
  response: MissingParametersResponse;
  selectedTemplateOptions: Record<string, string>;
}

function MissingParametersModal({ response, selectedTemplateOptions } : MissingParametersModalProps) {
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);
  
  useEffect(() => {
    setShow(true);
  }, [response]);

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton><strong>{response.missingByValue} Missing Parameters</strong></Modal.Header>
      <Modal.Body>
        <Container>
          {!response.parameters.length && <span>No missing parameters found for {response.missingByValue}.</span>}
          {!!response.parameters.length && <>
            <Row>
              <Col>Showing missing parameters for {response.missingByOption}: {response.missingByValue}.</Col>
            </Row>
            <Accordion alwaysOpen defaultActiveKey={Array.from(Array(response.parameters.length).keys()).map(x => x.toString())}>
              {response.parameters.map((x, idx) => {
                return (
                  <Accordion.Item eventKey={idx.toString()}>
                    <Accordion.Header>{x.name}</Accordion.Header>
                    <Accordion.Body>
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