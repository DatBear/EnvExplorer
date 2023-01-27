import { faClipboard, faCopy, faKeyboard, faPenToSquare, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState, useEffect } from "react";
import { Modal, Container, Row, Col, Button, Badge, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import DropdownItem from "react-bootstrap/esm/DropdownItem";
import Environment from "../Data/Environment";
import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import TemplatedParameterValueResponse from "../Data/Model/TemplatedParameterValueResponse";
import ParameterApiService from "../Services/ParameterApiService";
import ParameterEditor from "./ParameterEditor";

type EnvFileModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  group: ParameterGroupResponse;
  templateOptions: Record<string, string[]>;
  selectedTemplateOptions: Record<string, string>;
}

function EnvFileModal({show, setShow, group, templateOptions, selectedTemplateOptions}: EnvFileModalProps) {
  const parameterApiService = useMemo(() => new ParameterApiService(), []);

  const [fileOutput, setFileOutput] = useState('');
  const [recentlyCopied, setRecentlyCopied] = useState(false);

  const handleClose = () => setShow(false);

  useEffect(() => {
    setFileOutput(getFileOutput(group, Object.keys(selectedTemplateOptions).map(x => `#${x}: ${selectedTemplateOptions[x]}`).join('\n')+'\n\n'));
  }, [group, selectedTemplateOptions]);

  useEffect(() => {
    if(!recentlyCopied) return;
    setTimeout(() => {
      setRecentlyCopied(false);
    }, 2000);
  }, [recentlyCopied]);

  const getFileOutput = (group: ParameterGroupResponse, current: string = '') : string => {
    return current + group.parameters.map(x => {
      const value = x.value.indexOf(' ') > 0 ? `\"${x.value}\"` : x.value;
      return `${Environment.removeTemplate(x.name).replaceAll('/', '__')}=${value}\n`;
    }).join('') + group.children.map(x => getFileOutput(x)).join('');
  }

  const copyFile = () => {
    navigator.clipboard.writeText(fileOutput);
    setRecentlyCopied(true);
  }

  return (
    <Modal show={show} onHide={handleClose} size='xl' centered>
      <Modal.Header closeButton>
        <Container>
          <Row className='justify-content-md-center'>
            <Col><strong>.Env file</strong></Col>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>
              <pre>
                <div style={{position: 'relative'}}>
                  <div style={{position: 'absolute', right: '10px', top: '10px'}}>
                    <OverlayTrigger placement='top' overlay={<Tooltip id={'tooltip-copy-env'}>{recentlyCopied ? 'Copied!' : 'Copy file to clipboard'}</Tooltip>}>
                      <FontAwesomeIcon icon={faCopy} onClick={_ => copyFile()} />
                    </OverlayTrigger>
                  </div>
                </div>
                {fileOutput}
              </pre>
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

export default EnvFileModal;