import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState, useEffect } from "react";
import { Modal, Container, Row, Col, Button, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import Environment from "../Data/Environment";
import GetFileExportParametersRequest from "../Data/Model/GetFileExportParametersRequest";
import GetFileExportParametersResponse from "../Data/Model/GetFileExportParametersResponse";
import FileService from "../Services/FileService";
import ParameterApiService from "../Services/ParameterApiService";
import TemplateOption from "./TemplateOption";

type ExportFilesModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  templateOptions: Record<string, string[]>;
}

function ExportFilesModal({show, setShow, templateOptions}: ExportFilesModalProps) {
  const parameterApiService = useMemo(() => new ParameterApiService(), []);
  const fileService = useMemo(() => new FileService(), []);
  
  const [fileOutput, setFileOutput] = useState('');
  const [recentlyCopied, setRecentlyCopied] = useState(false);
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState<Record<string, string[]>>({});
  const [fileExport, setFileExport] = useState<GetFileExportParametersResponse>();

  //revert script options
  const [revertScriptFilePath, setRevertScriptFilePath] = useState('./revertEnvVars.sh');
  const [generateRevert, setGenerateRevertFile] = useState(true);
  const [revertOnly, setRevertOnly] = useState(false);
  const [selfDestructAfterReverting, setSelfDestructAfterReverting] = useState(true);
  //script options
  const [backupFiles, setBackupFiles] = useState(true);
  const [backupLocation, setBackupLocation] = useState('./backup');
  const [selfDestructAfter, setSelfDestructAfter] = useState(true);
  const [overwrite, setOverwrite] = useState(true);
  const [includeDateHeader, setIncludeDateHeader] = useState(false);
  const [includeEnvironmentHeader, setIncludeEnvironmentHeader] = useState(true);
  const [envFileName, setEnvFileName] = useState('.env');
  
  const handleClose = () => setShow(false);

  useEffect(() => {
    if(!recentlyCopied) return;
    setTimeout(() => {
      setRecentlyCopied(false);
    }, 2000);
  }, [recentlyCopied]);

  useEffect(() => {
    if(!fileExport) {
      setFileOutput('');
      return;
    }

    var script = fileService.generateScript(fileExport.files, {
      revertOnly: revertOnly,
      revertScriptFilePath: generateRevert ? revertScriptFilePath : '',
      selfDestructAfterReverting: selfDestructAfterReverting,
      includeDateHeader: includeDateHeader,
      includeEnvironmentHeader: includeEnvironmentHeader,
      overwrite: overwrite,
      selfDestructAfter: selfDestructAfter,
      backupLocation: backupFiles ? backupLocation : '',
      envFileName: envFileName
    });
    setFileOutput(script.toString());
  }, [fileService, fileExport, revertScriptFilePath, generateRevert, revertOnly, selfDestructAfterReverting, backupFiles, backupLocation, selfDestructAfter, overwrite, includeDateHeader, includeEnvironmentHeader, envFileName]);

  const setSelectedOptions = (name: string, values: string[]) => {
    selectedTemplateOptions[name] = values;
    setSelectedTemplateOptions({...selectedTemplateOptions});
    setFileOutput('');
    setFileExport(undefined);
  }

  const copyFile = () => {
    navigator.clipboard.writeText(fileOutput);
    setRecentlyCopied(true);
  }

  const generateFile = () => {
    var request : GetFileExportParametersRequest = {
      template: Environment.defaultTemplate,
      templateValues: selectedTemplateOptions
    };
    parameterApiService.getFileExport(request).then(res => {
      setFileExport(res);
    });
  }

  const scriptWillBackup = backupFiles && backupLocation;

  return (
    <Modal show={show} onHide={handleClose} size='xl' centered>
      <Modal.Header closeButton>
        <Container>
          <Row className='justify-content-md-center'>
            <Col><strong>Export to .Env files</strong></Col>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {templateOptions && <Row>
            {templateOptions && Object.keys(templateOptions).map((key, idx) => {
              return <TemplateOption key={idx} name={key} values={Object.values(templateOptions)[idx]} isMultiple={true} setMultipleSelection={setSelectedOptions} />
            })}
            
            <Col xs="auto">
              <div><strong>Script options</strong></div>
              <Form.Control id="envFileName" value={envFileName} onChange={e => setEnvFileName(e.target.value)} />
              <Form.Check id="backupCheckbox" label="Back-up files?" checked={backupFiles} onChange={e => setBackupFiles(e.target.checked)} />
              <Form.Control id="backupLocation" value={backupLocation} onChange={e => setBackupLocation(e.target.value)} disabled={!backupFiles} />
              <Form.Check id="overwriteRadio" label="Overwrite" type="radio" checked={overwrite} onChange={e => setOverwrite(e.target.checked)} inline />
              <Form.Check id="appendRadio" label="Append" type="radio" checked={!overwrite} onChange={e => setOverwrite(!e.target.checked)} inline />
              <Form.Check id="environmentHeaderCheckbox" label="Environment header?" checked={includeEnvironmentHeader} onChange={e => setIncludeEnvironmentHeader(e.target.checked)} />
              <Form.Check id="selfDestructCheckbox" label="Delete script after?" checked={selfDestructAfter} onChange={e => setSelfDestructAfter(e.target.checked)} />
            </Col>
            <Col xs="auto">
              <div><strong>Revert script options</strong></div>
              <Form.Check id="generateRevertCheckbox" label="Generate revert file" checked={generateRevert} onChange={e => setGenerateRevertFile(e.target.checked)} />
              <Form.Control id="revertScriptPath" value={revertScriptFilePath} onChange={e => setRevertScriptFilePath(e.target.value)} disabled={!generateRevert || revertOnly} />
              <Form.Check id="selfDestructRevertCheckbox" label="Delete script after reverting?" checked={selfDestructAfterReverting} onChange={e => setSelfDestructAfterReverting(e.target.checked)} />
              <Form.Check id="revertOnlyCheckbox" label="Generate ONLY revert file" checked={revertOnly} onChange={e => setRevertOnly(e.target.checked)} />
            </Col>
          </Row>}
          <Row className="pt-3">
          <Col xs="auto" >
              <Button variant="success" onClick={_ => generateFile()}>Generate Script</Button>
            </Col>
          </Row>
          <Row className="pt-3">
            {fileOutput && <Col>
              <div><strong>Directions</strong></div>
              <div>Save the script on the right to your environment directoy.</div>
              {!revertOnly && <div>
                It will create the following files containing environment variables:
                <ul>
                  {fileExport && fileExport.files.map((x, idx) => {
                    return <li key={idx}><code>{`./${x.path}/${envFileName}`}</code></li>
                  })}
                </ul>
              </div>}
              <div>
                The script <span className={scriptWillBackup ? "text-success" : "text-danger"}>will{!scriptWillBackup ? ' not': ''}</span> generate a backup{backupLocation ? <> at <code>{backupLocation}</code></> : ''}.
              </div>
              {!revertOnly && generateRevert && <div>
                Running the script will also generate a revert file at <code>{revertScriptFilePath}</code> that you can run to revert the changes.
              </div>}
            </Col>}
            {fileOutput && <Col>
              {(fileExport?.files.length ?? 0) > 0 && <b>Script</b>}
              {(fileExport?.files.length ?? 0) > 0 && <div className="file">
                <div style={{position: 'relative'}}>
                  <div className="copy-file-button">
                    <OverlayTrigger placement='top' overlay={<Tooltip id={'tooltip-copy-env'}>{recentlyCopied ? 'Copied!' : 'Copy file to clipboard'}</Tooltip>}>
                      <FontAwesomeIcon icon={faCopy} onClick={_ => copyFile()} />
                    </OverlayTrigger>
                  </div>
                </div>
                {fileOutput}
              </div>}
            </Col>}
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

export default ExportFilesModal;