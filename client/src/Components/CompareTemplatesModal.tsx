import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Container, Row, Col, Button } from "react-bootstrap";
import Environment from "../Data/Environment";
import ParameterValueResponse from "../Data/Model/ParameterValueResponse";
import ParameterStoreService from "../Services/ParameterStoreService";

type CompareTemplatesModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  templateOptions: Record<string, string[]>;
}

function CompareTemplatesModal({ show, setShow, templateOptions }: CompareTemplatesModalProps) {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState<Record<string, string>[]>([{} as Record<string, string>, {} as Record<string, string>]);
  const [parameterLists, setParameterLists] = useState<[ParameterValueResponse[]]>([[]]);
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
        setParameterLists([...parameterLists]);
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
        <Container>
          <Row className="justify-content-md-center">
            <Col><strong>Compare 2 templates</strong></Col>
          </Row>
        </Container>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {Object.keys(selectedTemplateOptions[0]).length > 0 && <Row className="mb-3">
            {selectedTemplateOptions.map((i, idx) => {
              return <Col key={idx}>
                <Row>
                  {Object.keys(templateOptions).map((k, idx) => {
                    return <Col key={idx} xs="auto">
                      <strong>{k}</strong>
                      <select value={i[k]} onChange={e => onTemplateValueSelected(idx, k, e.target.value)} className="form-control">
                        {templateOptions[k].map(x => {
                          return <option key={x} value={x}>{x}</option>
                        })}
                      </select>
                    </Col>;
                  })}
                </Row>
              </Col>
            })}
          </Row>}
          {hasTemplatesSelected() && <Row>
            <Col>
              {parameterNames.length > 0 && <table className="table table-hover table-bordered">
                <thead>
                  <tr>
                    <th>Name</th>
                    {selectedTemplateOptions.map((x, idx) => <th key={idx}>{Environment.getSelectedTemplatePrefix(x)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Total Parameters:</strong></td>
                    {parameterLists.map((x, idx) => <td key={idx}>{x.length}</td>)}
                  </tr>
                  {parameterNames.map((name, idx) => <tr key={idx}>
                    <td>{name}</td>
                    {selectedTemplateOptions.map((x, idx) => {
                      const value = parameterLists[idx].find(p => p.name.endsWith(name))?.value;
                      return <td key={idx} style={{ width: (100 / (selectedTemplateOptions.length + 1)) + '%' }} className={(value === '' || value === undefined ? 'bg-danger missing' : '') + ' wrap'}>{value}</td>
                    })}
                  </tr>)}
                </tbody>
              </table>}
            </Col>
          </Row>}
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CompareTemplatesModal;