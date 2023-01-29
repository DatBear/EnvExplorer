import { Accordion } from "react-bootstrap";
import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import ParameterValueResponse from "../Data/Model/ParameterValueResponse";
import SearchContext from "./Contexts/SearchContext";
import ParameterValue from "./ParameterValue";

type ParameterGroupProps = {
  group: ParameterGroupResponse;
  eventKey: string;
  updateSelectedParameter: (parameter: ParameterValueResponse) => void;
}

function ParameterGroup({ group, eventKey, updateSelectedParameter: setOffCanvasParameter } : ParameterGroupProps) {
  const lastName = (name: string) => {
    if(name === null) return null;
    return name.substring(name.lastIndexOf('/')+1);
  };

  const editParameter = (parameter: ParameterValueResponse) => {
    setOffCanvasParameter(parameter);
  };

  const showFromSearch = (group: ParameterGroupResponse, search: string) : boolean => {
    return search === '' 
      || group.children.find(x => x.name.toLowerCase().indexOf(search) >= 0) != null 
      || group.parameters.find(x => x.name.toLowerCase().indexOf(search) >= 0) != null
      || group.parameters.find(x => x.value.toLowerCase().indexOf(search) >= 0) != null
      || group.children.find(x => showFromSearch(x, search)) != null;
  };
  
  return (<SearchContext.Consumer>
    {search => <>
      {group.parameters.length > 0 && showFromSearch(group, search) &&
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Header>{lastName(group.name)}</Accordion.Header>
          <Accordion.Body>
            {group.parameters.map((param, idx) => <ParameterValue key={idx} name={param.name} value={param.value} editAction={e => editParameter(param)} />)}
            {group.children.map((child, idx) => {
              return <Accordion key={idx} defaultActiveKey={Array.from(Array(group.children.length).keys()).map(x => x.toString())} alwaysOpen><ParameterGroup eventKey={idx.toString()} group={child} updateSelectedParameter={setOffCanvasParameter} /></Accordion>
            })}
          </Accordion.Body>
        </Accordion.Item>
      }
      
      {group.children && group.children.length > 0 && group.parameters.length === 0 && group.children.map((child, idx) => {
        return <ParameterGroup key={idx} group={child} updateSelectedParameter={setOffCanvasParameter} eventKey={idx.toString()} />
      })}
    </>}
  </SearchContext.Consumer>
  );
}

export default ParameterGroup; 