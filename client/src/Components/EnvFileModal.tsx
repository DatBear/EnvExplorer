import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState, useEffect } from "react";
import { Modal, Container, Row, Col, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import FileService from "../Services/FileService";
import { useToasts } from "./Contexts/ToastContext";

type EnvFileModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  group: ParameterGroupResponse;
  templateOptions: Record<string, string[]>;
  selectedTemplateOptions: Record<string, string>;
}

function EnvFileModal({show, setShow, group, templateOptions, selectedTemplateOptions}: EnvFileModalProps) {
  const fileService = useMemo(() => new FileService(), []);

  const [fileOutput, setFileOutput] = useState('');

  const handleClose = () => setShow(false);

  const { addToast } = useToasts();

  useEffect(() => {
    let header = fileService.getTemplateHeader(selectedTemplateOptions);
    let fileOutput = fileService.generateFile(group, '', header, '');
    setFileOutput(fileOutput);
  }, [fileService, group, selectedTemplateOptions]);

  const copyFile = () => {
    navigator.clipboard.writeText(fileOutput);
    addToast({ message: 'File copied to clipboard!', textColor: 'success' });
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
              <div className="file">
                <div style={{position: 'relative'}}>
                  <div className="copy-file-button">
                    <OverlayTrigger placement='top' overlay={<Tooltip id={'tooltip-copy-env'}>Copy file to clipboard</Tooltip>}>
                      <FontAwesomeIcon icon={faCopy} onClick={_ => copyFile()} />
                    </OverlayTrigger>
                  </div>
                </div>
                {fileOutput}
              </div>
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