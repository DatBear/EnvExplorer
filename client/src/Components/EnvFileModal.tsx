import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState, useEffect } from "react";
import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import FileService from "../Services/FileService";
import { useToasts } from "./Contexts/ToastContext";
import Modal from "./Common/Modal";
import Button from "./Common/Button";
import OverlayTrigger from "./Common/OverlayTrigger";

type EnvFileModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  group: ParameterGroupResponse;
  templateOptions: Record<string, string[]>;
  selectedTemplateOptions: Record<string, string>;
}

function EnvFileModal({ show, setShow, group, templateOptions, selectedTemplateOptions }: EnvFileModalProps) {
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
        <div>
          <div className='justify-content-md-center'>
            <div><strong>.Env file</strong></div>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-3">
          <div className="file">
            <div className="relative">
              <div className="copy-file-button">
                <OverlayTrigger overlay={<div className="px-2">Copy file to clipboard</div>}>
                  <FontAwesomeIcon icon={faCopy} onClick={_ => copyFile()} />
                </OverlayTrigger>
              </div>
            </div>
            {fileOutput}
          </div>
          <Button className="w-max self-center">
            <a href={`data:application/octet-stream;base64,${btoa(fileOutput)}`} download={fileService.getFileName(selectedTemplateOptions)}>Download ({fileService.getFileName(selectedTemplateOptions)})</a>
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EnvFileModal;