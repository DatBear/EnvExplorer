import { Accordion } from "react-bootstrap";
import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import ParameterValueResponse from "../Data/Model/ParameterValueResponse";
import { searchFilterGroup, useSearch } from "./Contexts/SearchContext";
import ParameterValue from "./ParameterValue";

type ParameterGroupProps = {
  group: ParameterGroupResponse;
  eventKey: string;
  updateSelectedParameter: (parameter: ParameterValueResponse) => void;
}

function ParameterGroup({ group, eventKey, updateSelectedParameter: setOffCanvasParameter } : ParameterGroupProps) {
  const {search} = useSearch();

  const lastName = (name: string) => {
    if(name === null) return null;
    return name.substring(name.lastIndexOf('/')+1);
  };

  const editParameter = (parameter: ParameterValueResponse) => {
    setOffCanvasParameter(parameter);
  };

  return (<>
    {group.parameters.length > 0 && searchFilterGroup(search, group) &&
      <Accordion.Item eventKey={eventKey}>
        <Accordion.Header>{lastName(group.name)}</Accordion.Header>
        <Accordion.Body>
          {group.parameters.map((param, idx) => <ParameterValue key={idx} name={param.name} value={param.value} type={param.type} editAction={e => editParameter(param)} />)}
          {group.children.map((child, idx) => {
            return <Accordion key={idx} defaultActiveKey={Array.from(Array(group.children.length).keys()).map(x => x.toString())} alwaysOpen><ParameterGroup eventKey={idx.toString()} group={child} updateSelectedParameter={setOffCanvasParameter} /></Accordion>
          })}
        </Accordion.Body>
      </Accordion.Item>
    }
    
    {group.children && group.children.length > 0 && group.parameters.length === 0 && group.children.map((child, idx) => {
      return <ParameterGroup key={idx} group={child} updateSelectedParameter={setOffCanvasParameter} eventKey={idx.toString()} />
    })}
  </>);
}

export default ParameterGroup; 