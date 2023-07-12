import { faKeyboard, faPenToSquare, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";
import TemplatedParameterValueResponse from "../Data/Model/TemplatedParameterValueResponse";
import ParameterStoreService from "../Services/ParameterStoreService";
import { useToasts } from "./Contexts/ToastContext";
import ParameterEditor from "./ParameterEditor";
import Modal from "./Common/Modal";
import Button from "./Common/Button";
import Table, { Td, Th } from "./Common/Table";
import DropdownButton, { Dropdown } from "./Common/DropdownButton";

type CompareParametersModalProps = {
  response: CompareParametersResponse;
  editMode: boolean;
  selectedTemplateOptions: Record<string, string>;
}

function CompareParametersModal({ response, selectedTemplateOptions, editMode }: CompareParametersModalProps) {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);

  const [show, setShow] = useState(true);
  const [isEditMode, setIsEditMode] = useState(editMode);
  const [showTypes, setShowTypes] = useState(false);
  const [parameterTypes, setParameterTypes] = useState<{ opt: string, type: string | null }[]>([]);
  const [numParameterTypes, setNumParameterTypes] = useState(1);

  const handleClose = () => setShow(false);
  const toggleIsEditMode = () => setIsEditMode(!isEditMode);
  const toggleShowTypes = () => setShowTypes(!showTypes);

  const { addToast, addErrorToast } = useToasts();

  useEffect(() => {
    setShow(true);
    setIsEditMode(editMode);
    setParameterTypes(response.parameters.filter(x => x.type !== null).map(x => ({ opt: x.templateValues[response.compareByOption], type: x.type })));
    const numParameterTypes = [...new Set(response.parameters.filter(x => x.type !== null).map(x => x.type))].length
    setNumParameterTypes(numParameterTypes);
    setShowTypes(numParameterTypes > 1);
  }, [editMode, response]);

  const save = (parameter: TemplatedParameterValueResponse, type: string | null = null) => {
    if (parameter.value === null || parameter.value === '') {
      addErrorToast('Error: invalid parameter value');
      return;
    }
    parameterStoreService.saveParameterValue(parameter.name, parameter.value, type ?? parameter.type).then(res => {
      if (res.isSuccess) {
        addToast({ message: 'Successfully updated ' + parameter.name, textColor: 'success' });
      }
    }).catch(addErrorToast);
  }

  const onValueChanged = (template: TemplatedParameterValueResponse, value: string) => {
    template.value = value;
  }

  return (
    <Modal show={show} onHide={handleClose} size='xl' centered>
      <Modal.Header closeButton>
        <div>
          <div className="flex flex-row items-center justify-between">
            <strong>{response.parameterName}</strong>
            <div>
              <Button variant={showTypes ? "success" : "danger"} onClick={_ => toggleShowTypes()}><FontAwesomeIcon icon={faKeyboard} /></Button>&nbsp;
              <Button variant={isEditMode ? "success" : "danger"} onClick={_ => toggleIsEditMode()}><FontAwesomeIcon icon={faPenToSquare} /></Button>
            </div>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col gap-3">
          <div>Showing {response.parameterName} in every {response.compareByOption}.</div>
          <Table>
            <thead>
              <tr>
                <Th>{response.compareByOption}</Th>
                <Th>Name</Th>
                <Th>Value</Th>
                {isEditMode && <Th></Th>}
              </tr>
            </thead>
            <tbody>
              {response.parameters.map((x, idx) => {
                const isMissing = !x.value;
                return (<tr key={idx} className={isMissing ? "text-danger" : ""}>
                  <Td>{x.templateValues[response.compareByOption]}</Td>
                  <Td>
                    {x.name}
                    {showTypes && x.type && <><br /><span className="bg-primary-800 rounded-lg px-2">{x.type}</span></>}
                  </Td>
                  <Td className="wrap"><ParameterEditor value={x.value} isEditMode={isEditMode} onChange={v => onValueChanged(x, v)} /></Td>
                  {isEditMode && <Td>
                    {numParameterTypes === 1 && <Button variant="success" onClick={_ => save(x, parameterTypes[0].type)}><FontAwesomeIcon icon={faSave} size="sm" /></Button>}
                    {numParameterTypes > 1 && <DropdownButton title={<FontAwesomeIcon icon={faSave} size="sm" />}>
                      {[...new Set(parameterTypes.map(x => x.type))].map((type, idx) => {
                        return <Dropdown.Item key={idx} onClick={_ => save(x, type)}>Save as {type} [{parameterTypes.filter(t => t.type === type).length} {response.compareByOption}(s)]</Dropdown.Item>
                      })}
                    </DropdownButton>}
                  </Td>}
                </tr>);
              })}
            </tbody>
          </Table>
        </div>
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