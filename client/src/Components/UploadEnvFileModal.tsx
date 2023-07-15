import { useMemo, useState, useEffect, Fragment } from "react";
import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import FileService from "../Services/FileService";
import { useToasts } from "./Contexts/ToastContext";
import Modal from "./Common/Modal";
import Button from "./Common/Button";
import UploadedFile from "../Data/Model/UploadedFile";
import Table, { Td, Th, Tr } from "./Common/Table";
import Environment from "../Data/Environment";
import clsx from "clsx";
import UpdateParameterValueRequest from "../Data/Model/UpdateParameterValueRequest";
import ParameterStoreService from "../Services/ParameterStoreService";
import UpdateParameterValueResponse from "../Data/Model/UpdateParameterValueResponse";

type UploadEnvFileModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  group: ParameterGroupResponse;
  templateOptions: Record<string, string[]>;
  selectedTemplateOptions: Record<string, string>;
  setSelectedTemplateOptions: (opt: Record<string, string>) => void;
};

type SelectedOption<T> = {
  isSelected: boolean;
  isMissing: boolean;
  isChanged: boolean;
  oldValue: string;
  data: T;
};

type UpdateProgress<S, F> = {
  current: number;
  requests: Promise<S>[];
  successes: S[];
  failures: F[];
}

//let promise = new Promise<UpdateParameterValueResponse>(x => setTimeout(x, 5000));

function UploadEnvFileModal({ show, setShow, group, templateOptions, selectedTemplateOptions, setSelectedTemplateOptions }: UploadEnvFileModalProps) {
  const fileService = useMemo(() => new FileService(), []);
  const handleClose = () => setShow(false);
  const { addToast, addErrorToast } = useToasts();

  const [updateOptions, setUpdateOptions] = useState<SelectedOption<UpdateParameterValueRequest>[]>([]);
  const [updateProgress, setUpdateProgress] = useState<UpdateProgress<UpdateParameterValueResponse, string> | null>(null);

  let fileReader: FileReader;

  const handleFileChosen = (file: File | null) => {
    if (file === null) {
      return;
    }

    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  const handleFileRead = () => {
    const content = fileReader.result as string;
    var file = fileService.parseFile(selectedTemplateOptions, content);
    setUpdateOptions(getInitialOptions(group, file));
  };

  const getInitialOptions = (group: ParameterGroupResponse, file: UploadedFile): SelectedOption<UpdateParameterValueRequest>[] => {
    return group.parameters
      .map(x => {
        const fileParameter = file?.parameters.find(f => f.Name === x.name);
        const fileValue = fileParameter?.Value;
        const isChanged = x.value !== fileValue;
        const isMissing = fileParameter === undefined;

        return {
          isSelected: !isMissing && isChanged,
          isMissing: isMissing,
          isChanged: isChanged,
          oldValue: x.value,
          data: {
            name: x.name,
            type: x.type,
            value: fileValue
          } as UpdateParameterValueRequest
        };
      })
      .concat(group.children.flatMap(x => getInitialOptions(x, file)));
  };

  const toggleOption = (opt: SelectedOption<UpdateParameterValueRequest>) => {
    if (!opt.isChanged || opt.isMissing) return;

    const idx = updateOptions.findIndex(x => x.data.name === opt.data.name);
    setUpdateOptions(x => {
      x.splice(idx, 1, { ...opt, isSelected: !opt.isSelected });
      return [...x];
    });
  };

  const toggleAllOptions = () => {
    let anyEnabled = updateOptions.find(x => x.isSelected) !== undefined;
    setUpdateOptions(x => x.map(opt => ({ ...opt, isSelected: !anyEnabled && !opt.isMissing && opt.isChanged })));
  }

  const updateParameters = () => {
    setUpdateProgress({
      current: 0,
      requests: updateOptions.filter(x => x.isSelected).map(x => ParameterStoreService.instance.saveParameterValue(x.data.name, x.data.value, x.data.type)),
      successes: [],
      failures: []
    });
  };

  useEffect(() => {
    if (!updateProgress) return;

    if (updateProgress.requests.length) {
      (async () => {
        try {
          updateProgress.current++;
          let nextResponse = await updateProgress.requests.splice(0, 1)[0];
          updateProgress.successes.push(nextResponse);
        } catch (e) {
          addErrorToast(e);
          console.error('error updating parameter', e);
          updateProgress.current++;
          updateProgress.failures.push(getErrorMessage(e));
        } finally {
          setUpdateProgress({ ...updateProgress });
          addToast({ message: `Finished updating ${updateProgress.current - updateProgress.failures.length}/${updateProgress.current} parameters, with ${updateProgress.failures.length} errors.` });
        }
      })();
    }
    else {
      setUpdateOptions([]);
      setSelectedTemplateOptions({ ...selectedTemplateOptions });//re-render main ui to update values
      setTimeout(() => {
        setUpdateProgress(null);
      }, 5000);
    }
  }, [updateProgress, addToast, addErrorToast, selectedTemplateOptions, setSelectedTemplateOptions]);


  function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message
    return String(error)
  }

  const getUpdateProgressPercent = () => {
    if (!updateProgress) return 0;
    return Math.floor(updateProgress.current / (updateProgress.current + updateProgress.requests.length) * 100);
  }

  const displayRows = () => {
    return updateOptions.map((x, idx) => {
      return <Tr key={idx} className={clsx(!x.isMissing && !x.isChanged && 'text-secondary-400', x.isMissing && 'text-red-600')}>
        <Td>{x.isChanged && !x.isMissing && <input type="checkbox" checked={x.isSelected} onChange={() => toggleOption(x)} />}</Td>
        <Td>{x.data.name.replace(Environment.getSelectedTemplatePrefix(selectedTemplateOptions) + '/', '')}</Td>
        <Td className="w-[33%]">{x.oldValue}</Td>
        <Td className="w-[33%]">{x.data.value}</Td>
      </Tr>
    });
  };

  return <Modal show={show} onHide={handleClose} size='xl' centered>
    <Modal.Header closeButton>
      <div>
        <div className='justify-content-md-center'>
          <div><strong>Update variables from .env file</strong></div>
        </div>
      </div>
    </Modal.Header>
    <Modal.Body>
      <div className="flex flex-col gap-3">
        <input type="file" accept=".env" onChange={e => handleFileChosen(e.target.files && e.target.files[0])} />
        {updateOptions && updateOptions.length > 0 && <>
          <div className="flex flex-row justify-between items-center">
            <div>
              {Object.keys(selectedTemplateOptions).map(x => <div key={x}>{x}: {selectedTemplateOptions[x]}</div>)}
            </div>
            <div className="w-48 text-center border-primary-300 border p-2">
              <span className="text-primary-300">Legend</span>
              <div className="flex flex-row justify-between w-full items-center">
                <div>Changed Values</div>
                <div className="w-5 h-5 bg-white"></div>
              </div>
              <div className="flex flex-row justify-between w-full items-center">
                <div>Unchanged Values</div>
                <div className="w-5 h-5 bg-secondary-400"></div>
              </div>
              <div className="flex flex-row justify-between w-full items-center">
                <div>Missing Values</div>
                <div className="w-5 h-5 bg-red-600"></div>
              </div>
            </div>
          </div>
          <Table>
            <thead>
              <Tr>
                <Th><input type="checkbox" checked={updateOptions.find(x => x.isSelected) !== undefined} onChange={() => toggleAllOptions()} /></Th>
                <Th>Name</Th>
                <Th>Current</Th>
                <Th>File</Th>
              </Tr>
            </thead>
            <tbody>
              {displayRows()}
            </tbody>
          </Table>
          {updateOptions.filter(x => x.isSelected).length > 0 && !updateProgress && <div>
            <Button onClick={updateParameters}>Update {updateOptions.filter(x => x.isSelected).length} selected parameters</Button>
          </div>}
        </>}
        {updateProgress && <div className="pt-5">
          <span><b>Updating...</b> {updateProgress.current}/{updateProgress.current + updateProgress.requests.length} parameters</span>
          <div className="w-full bg-secondary-900 rounded-full h-6 mb-4">
            <div className="bg-primary-800 h-6 rounded-full text-center" style={{ width: `${getUpdateProgressPercent()}%` }}>{getUpdateProgressPercent()}%</div>
          </div>
          {updateProgress.failures.length > 0 && <div>Errors: {updateProgress.failures.length}</div>}
        </div>}
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={handleClose}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
}

export default UploadEnvFileModal;