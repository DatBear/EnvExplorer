import { useEffect, useMemo, useReducer, useState } from "react";
import Environment from "../Data/Environment";
import CompareParametersRequest from "../Data/Model/CompareParametersRequest";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";
import MissingParameterResponse from "../Data/Model/MissingParameterResponse";
import MissingParametersResponse from "../Data/Model/MissingParametersResponse";
import ParameterStoreService from "../Services/ParameterStoreService";
import { searchFilterMissingParameter, useSearch } from "./Contexts/SearchContext";
import { useToasts } from "./Contexts/ToastContext";
import { SearchBar } from "./SearchBar";
import Accordion from "./Common/Accordion";
import Modal from "./Common/Modal";
import Button from "./Common/Button";
import DropdownButton, { Dropdown } from "./Common/DropdownButton";
import Table, { Td, Th } from "./Common/Table";

type MissingParametersModalProps = {
  response: MissingParametersResponse;
  selectedTemplateOptions: Record<string, string>;
  updateCompareParametersResponse: (response: CompareParametersResponse, isEditMode: boolean) => void;
  refreshData: () => void;
}

function MissingParametersModal({ response, selectedTemplateOptions, updateCompareParametersResponse, refreshData }: MissingParametersModalProps) {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);
  const [parameterCounts, setParameterCounts] = useState({ parameters: 0, filteredParameters: 0 });

  const forceUpdate = useReducer(() => ({}), {})[1];

  const [show, setShow] = useState(true);
  const handleClose = () => setShow(false);

  const { search } = useSearch();
  const { addToast, addErrorToast } = useToasts();

  useEffect(() => {
    setShow(true);
  }, [response]);

  useEffect(() => {
    const total = response?.parameters.length ?? 0;
    setParameterCounts({
      parameters: total,
      filteredParameters: response?.parameters?.filter(x => searchFilterMissingParameter(search, x)).length ?? total
    });
  }, [response, search]);

  const addParameter = (name: string, value: string, type: string) => {
    parameterStoreService.saveParameterValue(name, value, type).then(res => {
      response.parameters = response.parameters.filter(x => x.name !== name);
      forceUpdate();
      addToast({ message: 'Parameter added: ' + name, textColor: 'success' });
    }).catch(addErrorToast);
  }

  const edit = (parameter: MissingParameterResponse) => {
    const request: CompareParametersRequest = {
      compareByOption: response.missingByOption,
      parameterName: parameter.name,
      template: Environment.defaultTemplate,
      templateValues: parameter.parameters[0].templateValues
    };

    parameterStoreService.compareParameters(request).then(res => {
      updateCompareParametersResponse(res, true);
    });
  }

  const parameterCount = () => {
    return parameterCounts.filteredParameters + (parameterCounts.filteredParameters !== parameterCounts.parameters ? `/${parameterCounts.parameters}` : '');
  };

  return <Modal show={show} onHide={handleClose} size="xl">
    <Modal.Header closeButton>
      <div className="flex flex-row gap-3 justify-between">
        <div className="pt-2"><strong>{response.missingByValue} Missing Parameters</strong></div>
        <SearchBar />
      </div>
    </Modal.Header>
    <Modal.Body>
      <div>
        {!response.parameters.length && <span>No missing parameters found for {response.missingByValue}.</span>}
        {!!response.parameters.length && <>
          <div>Showing <strong>{parameterCount()}</strong> missing parameters for {response.missingByOption}: {response.missingByValue}.</div>
          {response.parameters.filter(x => searchFilterMissingParameter(search, x)).map(x => <Accordion key={x.name} defaultOpen>
            {({ open }) => <>
              <Accordion.Button open={open}>{x.name}</Accordion.Button>
              <Accordion.Panel>
                <div className="flex flex-col gap-3">
                  <Table>
                    <thead>
                      <tr>
                        <Th>{response.missingByOption}</Th>
                        <Th>Name</Th>
                        <Th>Value</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {x.parameters.map((x, idx) => {
                        return (<tr key={idx}>
                          <Td >{x.templateValues[response.missingByOption]}</Td>
                          <Td>{x.name}</Td>
                          <Td className="wrap max-w-2xl">{x.value}</Td>
                        </tr>);
                      })}
                    </tbody>
                  </Table>
                  <div className="flex flex-row gap-3">
                    <DropdownButton title="Copy from">
                      {x.parameters.map((p, idx) => {
                        return (<Dropdown.Item key={idx} onClick={_ => addParameter(x.name, p.value!, p.type!)}>{p.templateValues[response.missingByOption]}</Dropdown.Item>)
                      })}
                    </DropdownButton>
                    <Button onClick={_ => edit(x)}>Edit all</Button>
                  </div>
                </div>
              </Accordion.Panel>
            </>}
          </Accordion>)}
        </>}
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>Close</Button>
    </Modal.Footer>
  </Modal>
}

export default MissingParametersModal;

