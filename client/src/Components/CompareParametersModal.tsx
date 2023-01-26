import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Modal } from "react-bootstrap";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";

type CompareParametersModalProps = {
  response: CompareParametersResponse;
  selectedTemplateOptions: Record<string, string>;
}

function CompareParametersModal({ response, selectedTemplateOptions } : CompareParametersModalProps) {
  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);
  
  useEffect(() => {
    setShow(true);
  }, [response]);

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton><strong>{response.parameterName}</strong></Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>Showing {response.parameterName} in every {response.compareByOption}.</Col>
          </Row>
          <Row className="pt-3">
            <Col>
              <table className="table table-bordered table-dark table-striped">
                <thead>
                  <th>{response.compareByOption}</th>
                  <th>Name</th>
                  <th>Value</th>
                </thead>
                <tbody>
                  {response.parameters.map((x, idx) => {
                    const isMissing = x.value === null;
                    return (<tr key={idx} className={isMissing ? 'missing' : ''}>
                      <td>{x.templateValues[response.compareByOption]}</td>
                      <td>{x.name}</td>
                      <td>
                        {isMissing ? <span></span> : x.value}
                      </td>
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