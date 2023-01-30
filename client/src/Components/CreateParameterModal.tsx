import { useMemo, useState, useEffect } from "react";
import { Modal, Container, Row, Col, Button, InputGroup, Form } from "react-bootstrap";
import Environment from "../Data/Environment";
import ParameterApiService from "../Services/ParameterApiService";
import ParameterStoreService from "../Services/v2/ParameterStoreService";
import { useToasts } from "./Contexts/ToastContext";

type CreateParameterModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  templateOptions: Record<string, string[]>;
  selectedTemplateOptions: Record<string, string>;
}

function CreateParameterModal({show, setShow, templateOptions, selectedTemplateOptions}: CreateParameterModalProps) {
  //const parameterApiService = useMemo(() => new ParameterApiService(), []);
  const parameterApiService = useMemo(() => ParameterStoreService.instance, []);

  const availableTypes = ['String', 'SecureString'];

  const [name, setName] = useState('');
  const [type, setType] = useState(availableTypes[0]);
  const [value, setValue] = useState('');

  const handleClose = () => setShow(false);

  const { addToast } = useToasts();

  useEffect(() => {
    
  }, [selectedTemplateOptions]);

  const updateName = (inputValue: string) => {
    inputValue = inputValue.replaceAll('__', '/');
    const split = inputValue.split('=');
    if(split.length >= 2) {
      inputValue = split[0]
      setValue(split.filter((x, idx) => idx > 0).join('='));
    }
    setName(inputValue);
  }

  const save = () => {
    const fullName = `${Environment.getSelectedTemplatePrefix(selectedTemplateOptions)}/${name}`;
    parameterApiService.saveParameterValue(fullName, value, type).then(res => {
      if(res.isSuccess) {
        setName('');
        setType(availableTypes[0]);
        setValue('');
        handleClose();
      } else {
        addToast({ message: 'Error saving parameter.', textColor: 'danger' })
      }
    }).catch(e => {
      addToast({ message: 'Error saving parameter: ' + e, textColor: 'danger' })
    });
  }

  return (
    <Modal show={show} onHide={handleClose} size='lg' centered>
      <Modal.Header closeButton>
        <Container>
          <Row className='justify-content-md-center'>
            <Col><strong>Create parameter in {Environment.getSelectedTemplatePrefix(selectedTemplateOptions)}</strong></Col>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Label htmlFor="paramName">Name</Form.Label>
                <InputGroup>
                  <InputGroup.Text id="paramName">{Environment.getSelectedTemplatePrefix(selectedTemplateOptions)}/</InputGroup.Text>
                  <Form.Control placeholder="Parameter name" aria-label="Parameter name" aria-describedby="paramName" value={name} onChange={e => updateName(e.target.value)} />
                </InputGroup>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label htmlFor="paramValue">Value</Form.Label>
                <Form.Control id="paramValue" placeholder="Parameter value" value={value} onChange={e => setValue(e.target.value)} />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Form.Label htmlFor="paramType">Type</Form.Label>
                <Form.Select id="paramType" aria-label="Parameter type" value={type} onChange={e => setType(e.target.value)}>
                  {availableTypes.map(x => <option key={x} value={x}>{x}</option>)}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <span className="text-muted">Note: pasting a value from a local env file will fill out the name and value.</span>
              </Col>
            </Row>
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClose}>Cancel</Button>
        <Button variant="success" onClick={_ => save()}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateParameterModal;