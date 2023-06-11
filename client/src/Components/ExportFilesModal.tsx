import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState, useEffect } from "react";
import Environment from "../Data/Environment";
import GetFileExportParametersRequest from "../Data/Model/GetFileExportParametersRequest";
import GetFileExportParametersResponse from "../Data/Model/GetFileExportParametersResponse";
import ScriptGenerationOptions from "../Data/Model/ScriptGenerationOptions";
import FileService from "../Services/FileService";
import ParameterStoreService from "../Services/ParameterStoreService";
import { useToasts } from "./Contexts/ToastContext";
import TemplateOption from "./TemplateOption";
import Modal from "./Common/Modal";
import Button from "./Common/Button";
import Input from "./Common/Input";
import Checkbox from "./Common/Checkbox";
import OverlayTrigger from "./Common/OverlayTrigger";

type ExportFilesModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  templateOptions: Record<string, string[]>;
}

function ExportFilesModal({ show, setShow, templateOptions }: ExportFilesModalProps) {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);

  const fileService = useMemo(() => new FileService(), []);

  const [fileOutput, setFileOutput] = useState('');
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState<Record<string, string[]>>({});
  const [fileExport, setFileExport] = useState<GetFileExportParametersResponse>();

  //script options
  const [scriptOptions, setScriptOptions] = useState<ScriptGenerationOptions>({
    includeDateHeader: false,
    includeEnvironmentHeader: true,
    overwrite: true,
    revertOnly: false,
    selfDestructAfter: true,
    selfDestructAfterReverting: true,
    backupLocation: './backup',
    envFileName: '.env',
    revertScriptFilePath: './revertEnvVars.sh'
  });
  const [generateRevertScript, setGenerateRevertScript] = useState(true);
  const [backupFiles, setBackupFiles] = useState(true);

  const handleClose = () => setShow(false);

  const { addToast } = useToasts();

  useEffect(() => {
    if (!fileExport) {
      setFileOutput('');
      return;
    }

    var script = fileService.generateScript(fileExport.files, {
      ...scriptOptions,
      revertScriptFilePath: generateRevertScript ? scriptOptions.revertScriptFilePath : '',
      backupLocation: backupFiles ? scriptOptions.backupLocation : ''
    });
    setFileOutput(script.toString());
  }, [fileService, fileExport, scriptOptions, backupFiles, generateRevertScript]);

  const setSelectedOptions = (name: string, values: string[]) => {
    selectedTemplateOptions[name] = values;
    setSelectedTemplateOptions({ ...selectedTemplateOptions });
    setFileOutput('');
    setFileExport(undefined);
  }

  const copyFile = () => {
    navigator.clipboard.writeText(fileOutput);
    addToast({ message: 'Script copied to clipboard!', textColor: 'success' });
  }

  const generateFile = () => {
    var request: GetFileExportParametersRequest = {
      template: Environment.defaultTemplate,
      templateValues: selectedTemplateOptions
    };
    parameterStoreService.getFileExport(request).then(res => {
      setFileExport(res);
    });
  }

  const scriptWillBackup = backupFiles && scriptOptions.backupLocation;

  return <Modal show={show} onHide={handleClose} size='xl' centered>
    <Modal.Header closeButton>
      <div>
        <div className='justify-content-md-center'>
          <div><strong>Export to .Env files</strong></div>
        </div>
      </div>
    </Modal.Header>
    <Modal.Body>
      <div>
        {templateOptions && <div className="flex flex-row gap-4">
          {templateOptions && Object.keys(templateOptions).map((key, idx) => {
            return <TemplateOption key={key} name={key} values={Object.values(templateOptions)[idx]} multiple setMultipleSelection={setSelectedOptions} />
          })}

          <div className="w-max flex flex-col gap-0.5">
            <div><strong>Script options</strong></div>
            <Input id="envFileName" placeholder=".env file name(s)" value={scriptOptions.envFileName!} onChange={e => setScriptOptions({ ...scriptOptions, envFileName: e.target.value })} />
            <Checkbox id="backupCheckbox" label="Back-up files?" checked={backupFiles} onChange={e => setBackupFiles(e.target.checked)} />
            <Input id="backupLocation" placeholder="Back-up folder path" value={scriptOptions.backupLocation} onChange={e => setScriptOptions({ ...scriptOptions, backupLocation: e.target.value })} disabled={!backupFiles} />
            <Checkbox id="overwriteRadio" label="Overwrite" type="radio" checked={scriptOptions.overwrite} onChange={e => setScriptOptions({ ...scriptOptions, overwrite: e.target.checked })} />
            <Checkbox id="appendRadio" label="Append" type="radio" checked={!scriptOptions.overwrite} onChange={e => setScriptOptions({ ...scriptOptions, overwrite: !e.target.checked })} />
            <Checkbox id="environmentHeaderCheckbox" label="Environment header?" checked={scriptOptions.includeEnvironmentHeader} onChange={e => setScriptOptions({ ...scriptOptions, includeEnvironmentHeader: e.target.checked })} />
            <Checkbox id="selfDestructCheckbox" label="Delete script after?" checked={scriptOptions.selfDestructAfter} onChange={e => setScriptOptions({ ...scriptOptions, selfDestructAfter: e.target.checked })} />
          </div>
          <div className="w-max flex flex-col gap-0.5">
            <div><strong>Revert script options</strong></div>
            <Checkbox id="generateRevertCheckbox" label="Generate revert script" checked={generateRevertScript} onChange={e => setGenerateRevertScript(e.target.checked)} />
            <Input id="revertScriptPath" placeholder="Revert script path" value={scriptOptions.revertScriptFilePath!} onChange={e => setScriptOptions({ ...scriptOptions, revertScriptFilePath: e.target.value })} disabled={!generateRevertScript || scriptOptions.revertOnly} />
            <Checkbox id="selfDestructRevertCheckbox" label="Delete script after reverting?" checked={scriptOptions.selfDestructAfterReverting} onChange={e => setScriptOptions({ ...scriptOptions, selfDestructAfterReverting: e.target.checked })} />
            <Checkbox id="revertOnlyCheckbox" label="Generate ONLY revert script" checked={scriptOptions.revertOnly} onChange={e => setScriptOptions({ ...scriptOptions, revertOnly: e.target.checked })} />
          </div>
        </div>}
        <div className="pt-3">
          <div className="w-max" >
            <Button variant="success" onClick={_ => generateFile()}>Generate Script</Button>
          </div>
        </div>
        <div className="pt-3">
          {fileOutput && <div>
            <div><strong>Directions</strong></div>
            <div>Save the script on the right to your environment directoy.</div>
            {!scriptOptions.revertOnly && <div>
              It will create the following files containing environment variables:
              <ul>
                {fileExport && fileExport.files.map((x, idx) => {
                  return <li key={idx}><code>{`./${x.path}/${scriptOptions.envFileName}`}</code></li>
                })}
              </ul>
            </div>}
            <div>
              The script <span className={scriptWillBackup ? "text-success" : "text-danger"}>will{!scriptWillBackup ? ' not' : ''}</span> generate a backup{scriptOptions.backupLocation ? <> at <code>{scriptOptions.backupLocation}</code></> : ''}.
            </div>
            {!scriptOptions.revertOnly && generateRevertScript && <div>
              Running the script will also generate a revert file at <code>{scriptOptions.revertScriptFilePath}</code> that you can run to revert the changes.
            </div>}
          </div>}
          {fileOutput && <div>
            {(fileExport?.files.length ?? 0) > 0 && <b>Script</b>}
            {(fileExport?.files.length ?? 0) > 0 && <div className="file">
              <div className="relative">
                <div className="copy-file-button">
                  <OverlayTrigger placement='top' overlay={<>Copy script to clipboard</>}>
                    <FontAwesomeIcon icon={faCopy} onClick={_ => copyFile()} />
                  </OverlayTrigger>
                </div>
              </div>
              {fileOutput}
            </div>}
          </div>}
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
}

export default ExportFilesModal;