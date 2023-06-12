import { useMemo, useState, useEffect } from "react";
import Environment from "../Data/Environment";
import ParameterStoreService from "../Services/ParameterStoreService";
import { useToasts } from "./Contexts/ToastContext";
import Modal from "./Common/Modal";
import Button from "./Common/Button";
import Input from "./Common/Input";
import Select from "./Common/Select";
import Option from "./Common/Option";

type CreateParameterModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  templateOptions: Record<string, string[]>;
  selectedTemplateOptions: Record<string, string>;
}

function CreateParameterModal({ show, setShow, templateOptions, selectedTemplateOptions }: CreateParameterModalProps) {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);

  const availableTypes = ["String", "SecureString"];

  const [name, setName] = useState("");
  const [type, setType] = useState(availableTypes[0]);
  const [value, setValue] = useState("");

  const { addToast } = useToasts();

  const handleClose = () => {
    setValue("");
    setName("");
    setType(availableTypes[0]);

    setShow(false);
  }

  useEffect(() => {

  }, [selectedTemplateOptions]);

  const updateName = (inputValue: string) => {
    inputValue = inputValue.replaceAll("__", "/");
    const split = inputValue.split("=");
    if (split.length >= 2) {
      inputValue = split[0]
      setValue(split.filter((x, idx) => idx > 0).join("="));
    }
    setName(inputValue);
  }

  const save = () => {
    const fullName = `${Environment.getSelectedTemplatePrefix(selectedTemplateOptions)}/${name}`;
    parameterStoreService.saveParameterValue(fullName, value, type).then(res => {
      if (res.isSuccess) {
        addToast({ message: "Save successful!", textColor: "success" });
        handleClose();
      } else {
        addToastError("Error saving parameter.");
      }
    }).catch(e => {
      addToastError(e);
    });
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <div>
          <div className="justify-content-md-center">
            <div><strong>Create parameter in {Environment.getSelectedTemplatePrefix(selectedTemplateOptions)}</strong></div>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div>
          <form className="text-left flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="paramName">Name</label>
              <div className="flex flex-row">
                <div id="paramName">{Environment.getSelectedTemplatePrefix(selectedTemplateOptions)}/</div>
                <Input placeholder="Parameter name" value={name} onChange={e => updateName(e.target.value)} className="flex-grow" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="paramValue">Value</label>
              <Input id="paramValue" placeholder="Parameter value" value={value} onChange={e => setValue(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="paramType">Type</label>
              <Select id="paramType" value={type} onChange={e => setType(e.target.value)}>
                {availableTypes.map(x => <Option key={x} value={x}>{x}</Option>)}
              </Select>
            </div>
            <div className="">
              <span className="text-muted">Note: pasting a value from a local env file will fill out the name and value.</span>
            </div>
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={_ => save()}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateParameterModal;

function addToastError(arg0: string) {
  throw new Error("Function not implemented.");
}
