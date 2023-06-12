import { useCallback, useEffect, useMemo, useState } from "react";
import { CachedParameter } from "../Data/Model/CachedParameter";
import ParameterStoreService from "../Services/ParameterStoreService";
import DatePicker from 'react-datepicker';
import { ParameterHistory } from "@aws-sdk/client-ssm";
import "react-datepicker/dist/react-datepicker.css";
import TemplateOption from "./TemplateOption";
import Modal from "./Common/Modal";
import Button from "./Common/Button";
import Table, { Td, Th } from "./Common/Table";

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
      const filteredSorted = x.filter(x => x.lastModifiedDate && x.lastModifiedDate > utcDate).sort((a, b) => a.lastModifiedDate < b.lastModifiedDate ? -1 : 1);
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
    var earliestDate = history[name]?.filter(x => x?.LastModifiedDate).sort((a, b) => a.LastModifiedDate! > b.LastModifiedDate! ? -1 : 1).find(x => x.LastModifiedDate! < date)?.LastModifiedDate;
    return history[name]?.filter(x => x.LastModifiedDate && x.LastModifiedDate >= (earliestDate ?? date));
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().substring(2)}`;
  }

  return <Modal show={show} onHide={handleClose} size='xl' centered>
    <Modal.Header closeButton>
      <div>
        <div className='justify-content-md-center'>
          <div><strong>Parameter History</strong></div>
        </div>
      </div>
    </Modal.Header>
    <Modal.Body>
      <div className="w-full">
        <div className="ps-2 flex flex-row gap-3 items-end">
          {templateOptions && Object.keys(templateOptions).map((key, idx) => {
            return <TemplateOption key={idx} name={key} values={Object.values(templateOptions)[idx]} setSelection={setSelectedTemplateOption} />
          })}
          {(recentParameters?.length ?? 0) > 0 && <div className="pt-4 w-max"><Button onClick={_ => fetchParameterHistory()}>Show History</Button></div>}
        </div>
        <div className="pt-2">
          <div className="w-max">Show parameters modified since:</div>
          <div className="w-max"><DatePicker selected={date} dateFormat="MM-dd-yyyy" onChange={d => d && updateDate(d)} className="bg-inherit border border-emerald-800 px-2 py-1" /></div>
        </div>
        {recentParameters?.map(x => {
          const currHistory = historySince(x.name, utcDate);
          return <div key={x.name}>
            <div className="p-1">
              <>
                <div className="flex flex-row gap-2">
                  {!isHistoryLoaded && <>
                    <div className="w-max">{formatDate(x.lastModifiedDate)}</div>
                    <div>{x.name}</div>
                  </>}
                  {isHistoryLoaded && <>
                    <div>{x.name}{currHistory?.find(x => x.Version === 1) !== undefined && <span className="ml-2 px-1 bg-green-600 rounded-md">New</span>}</div>
                  </>}
                </div>
                {currHistory && <div>
                  <div>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Date</Th>
                          <Th>Value</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {currHistory.map(h => {
                          return <tr key={h.Version}>
                            <Td className="px-2">{formatDate(h.LastModifiedDate)}</Td>
                            <Td className="px-2 wrap max-w-4xl">{h.Value}</Td>
                          </tr>
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>}
              </>
            </div>
          </div>
        })}
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={handleClose}>Close</Button>
    </Modal.Footer>
  </Modal>
}