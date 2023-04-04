import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Container, Row, Col, Button } from "react-bootstrap";
import { CachedParameter } from "../Data/Model/CachedParameter";
import ParameterStoreService from "../Services/ParameterStoreService";
import DatePicker from 'react-datepicker';
import { ParameterHistory } from "@aws-sdk/client-ssm";
import "react-datepicker/dist/react-datepicker.css";
import TemplateOption from "./TemplateOption";

type ParameterHistoryModalProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

const twoWeeks = 12096e5;
const defaultDate = new Date(Date.now() - twoWeeks);
defaultDate.setHours(0, 0, 0, 0);
const defaultUtcDate = new Date(defaultDate);
defaultUtcDate.setUTCHours(0, 0, 0, 0);

export default function ParameterHistoryModal({ show, setShow }: ParameterHistoryModalProps) {
  const parameterStoreService = useMemo(() => ParameterStoreService.instance, []);
  const [date, setDate] = useState(defaultDate);
  const [utcDate, setUtcDate] = useState(defaultUtcDate);
  const [recentParameters, setRecentParameters] = useState<CachedParameter[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [history, setHistory] = useState<Record<string, ParameterHistory[]>>({});

  const [templateOptions, setTemplateOptions] = useState<Record<string, string[]>>({});
  const [selectedTemplateOptions, setSelectedTemplateOptions] = useState<Record<string, string>>({});

  const handleClose = () => setShow(false);

  const getTemplateOptions = useCallback(() => {
    parameterStoreService.getTemplateOptions(true).then(data => {
      setTemplateOptions(data);
    })
  }, [parameterStoreService]);

  useEffect(() => {
    setHistory({});

    const utc = new Date(date);
    utc.setUTCHours(0, 0, 0, 0);
    setUtcDate(utc);
  }, [date]);

  useEffect(() => {
    if (!show) return;
    parameterStoreService.listParameters(selectedTemplateOptions).then(x => {
      const filteredSorted = x.filter(x => x.lastModifiedDate && x.lastModifiedDate > utcDate).sort((a, b) => a.lastModifiedDate < b.lastModifiedDate ? 1 : -1);
      setRecentParameters(filteredSorted);
    })
  }, [show, utcDate, selectedTemplateOptions, parameterStoreService, getTemplateOptions]);

  useEffect(() => {
    const isLoaded = recentParameters.length > 0 && Object.keys(history).length >= recentParameters.length;
    setIsHistoryLoaded(isLoaded);
  }, [history, recentParameters]);

  useEffect(() => {
    if (!show) {
      return;
    }
    getTemplateOptions();
  }, [show, getTemplateOptions]);

  const fetchParameterHistory = () => {
    setHistory({});
    recentParameters.forEach(p => {
      parameterStoreService.getParameterHistory(p.name).then(res => {
        setHistory(h => ({ ...h, [p.name]: res }));
      });
    })
  }

  const setSelectedTemplateOption = (key: string, value: string) => {
    selectedTemplateOptions[key] = value;
    setSelectedTemplateOptions({ ...selectedTemplateOptions });
  };

  const updateDate = (selected: Date) => {
    console.log(selected.toUTCString());
    selected.setHours(0, 0, 0, 0);
    setDate(selected);
  }

  const historySince = (name: string, date: Date) => {
    return history[name]?.filter(x => x.LastModifiedDate && x.LastModifiedDate > date);
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().substring(2)}`;
  }

  return <Modal show={show} onHide={handleClose} size='xl' centered>
    <Modal.Header closeButton>
      <Container>
        <Row className='justify-content-md-center'>
          <Col><strong>Parameter History</strong></Col>
        </Row>
      </Container>
    </Modal.Header>
    <Modal.Body>
      <Container>
        <Row className="ps-2">
          {templateOptions && Object.keys(templateOptions).map((key, idx) => {
            return <TemplateOption key={idx} name={key} values={Object.values(templateOptions)[idx]} setSelection={setSelectedTemplateOption} />
          })}
          {(recentParameters?.length ?? 0) > 0 && <Col xs="auto" className="pt-4"><button className="btn btn-primary" onClick={_ => fetchParameterHistory()}>Show History</button></Col>}
        </Row>
        <Row className="pt-2">
          <Col xs="auto">Show parameters modified since:</Col>
          <Col xs="auto"><DatePicker selected={date} dateFormat="MM-dd-yyyy" onChange={d => d && updateDate(d)} className="form-control" /></Col>
        </Row>
        {recentParameters?.map(x => {
          const currHistory = historySince(x.name, utcDate);
          return <Row key={x.name}>
            <Col>
              <>
                <Row>
                  {!isHistoryLoaded && <>
                    <Col xs="auto">{formatDate(x.lastModifiedDate)}</Col>
                    <Col>{x.name}</Col>
                  </>}
                  {isHistoryLoaded && <>
                    <Col>{x.name}{currHistory?.find(x => x.Version === 1) !== undefined && <span className="badge badge-pill badge-success">Success</span>}</Col>
                  </>}
                </Row>
                {currHistory && <Row>
                  <Col>
                    <table className="table table-bordered inline">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currHistory.map(h => {
                          return <tr key={h.Version}>
                            <td>{formatDate(h.LastModifiedDate)}</td>
                            <td>{h.Value}</td>
                          </tr>
                        })}
                      </tbody>
                    </table>
                  </Col>
                </Row>}
              </>
            </Col>
          </Row>
        })}
      </Container>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
}