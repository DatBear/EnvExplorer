import { useCallback, useEffect, useMemo, useState } from "react";
import Environment from "../Data/Environment";
import { CachedParameter } from "../Data/Model/CachedParameter";
import ParameterStoreService from "../Services/ParameterStoreService";
import Modal from "./Common/Modal";
import Button from "./Common/Button";
import Table, { Td, Th } from "./Common/Table";
import Select from "./Common/Select";
import clsx from "clsx";

type CompareTemplatesModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  templateOptions: Record<string, string[]>;
}

function CompareTemplatesModal({ show, setShow, templateOptions }: CompareTemplatesModalProps) {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState<Record<string, string>[]>([{} as Record<string, string>, {} as Record<string, string>]);
  const [parameterLists, setParameterLists] = useState<[CachedParameter[]]>([[]]);
  const [parameterNames, setParameterNames] = useState<string[]>([]);

  const handleClose = () => {
    setShow(false);
  }

  const hasTemplatesSelected = useCallback(() => {
    return [...new Set(selectedTemplateOptions.flatMap(x => Object.keys(x).map(k => x[k])).flatMap(x => x))].length > Object.keys(templateOptions).length;
  }, [templateOptions, selectedTemplateOptions]);

  useEffect(() => {
    const defaultSelection = {} as Record<string, string>;
    Object.keys(templateOptions).forEach(x => {
      defaultSelection[x] = templateOptions[x][0];
    });
    setSelectedTemplateOptions([{ ...defaultSelection }, { ...defaultSelection }]);
  }, [templateOptions]);

  useEffect(() => {
    if (!hasTemplatesSelected()) return;

    for (let x = 0; x < selectedTemplateOptions.length; x++) {
      parameterStoreService.listParameters(selectedTemplateOptions[x]).then(data => {
        parameterLists[x] = data;
        setParameterLists(_ => [...parameterLists]);
      })
    }
  }, [selectedTemplateOptions, hasTemplatesSelected]);

  useEffect(() => {
    setParameterNames([...new Set(parameterLists.flatMap(x => x).map(x => Environment.removeTemplate(x.name)))].sort((a, b) => (a.toLowerCase() > b.toLowerCase()) ? 1 : ((b.toLowerCase() > a.toLowerCase()) ? -1 : 0)));
  }, [parameterLists]);



  const onTemplateValueSelected = (idx: number, key: string, val: string) => {
    selectedTemplateOptions[idx][key] = val;
    setSelectedTemplateOptions([...selectedTemplateOptions]);
  }

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <strong>Compare 2 templates</strong>
      </Modal.Header>
      <Modal.Body>
        <div>
          {Object.keys(selectedTemplateOptions[0]).length > 0 && <div className="flex flex-row mb-3 w-full justify-around">
            {selectedTemplateOptions.map((i, idx) => <div key={idx} className="flex flex-col gap-2">
              {Object.keys(templateOptions).map((k, optIdx) => <div key={optIdx} className="flex flex-row justify-between gap-2">
                <strong>{k}</strong>
                <Select value={i[k]} onChange={e => onTemplateValueSelected(idx, k, e.target.value)} className="form-control">
                  {templateOptions[k].map(x => {
                    return <option key={x} value={x}>{x}</option>
                  })}
                </Select>
              </div>)}
            </div>)}
          </div>}
          {hasTemplatesSelected() && <div>
            <div>
              {parameterNames.length > 0 && <Table>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    {selectedTemplateOptions.map((x, idx) => <Th key={idx}>{Environment.getSelectedTemplatePrefix(x)}</Th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td><strong>Total Parameters:</strong></Td>
                    {parameterLists.map((x, idx) => <Td key={idx}>{x.length}</Td>)}
                  </tr>
                  {parameterNames.map((name, idx) => <tr key={idx}>
                    <Td>{name}</Td>
                    {selectedTemplateOptions.map((x, idx) => {
                      const value = parameterLists[idx].find(p => p.name.endsWith(name))?.value;
                      const isMissing = value === '' || value === undefined;
                      return <Td key={idx} style={{ width: (100 / (selectedTemplateOptions.length + 1)) + '%' }} className={clsx(isMissing ? 'bg-red-700 bg-opacity-40' : '', 'wrap')}>{value}</Td>
                    })}
                  </tr>)}
                </tbody>
              </Table>}
            </div>
          </div>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CompareTemplatesModal;