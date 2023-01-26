import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import ParameterValueResponse from "../Data/Model/ParameterValueResponse";
import ParameterValue from "./ParameterValue";

type ParameterGroupProps = {
  group: ParameterGroupResponse;
  updateSelectedParameter: (parameter: ParameterValueResponse) => void;
}

function ParameterGroup({ group, updateSelectedParameter: setOffCanvasParameter } : ParameterGroupProps) {

  const getId = (name: string) => {
    return name.replace(/^[^a-z]+|[^\w:.-]+/gi, "");
  }

  const lastName = (name: string) => {
    return name.substring(name.lastIndexOf('/')+1);
  }

  const editParameter = (parameter: ParameterValueResponse) => {
    setOffCanvasParameter(parameter);
  }
  
  const id = "panels-"+getId(group.name);
  return (<>
    {group.parameters.length > 0 && 
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={"#panels-"+id} aria-expanded="true">
            {lastName(group.name)}
          </button>
        </h2>
        <div id={"panels-"+id} className="accordion-collapse collapse show">
          <div className="accordion-body">
            {group.parameters.map((param, idx) => <ParameterValue key={idx} name={param.name} value={param.value} editAction={e => editParameter(param)} />)}
            {group.children.map((child, idx) => {
              return <div className="accordion nested" key={idx}><ParameterGroup group={child} updateSelectedParameter={setOffCanvasParameter} /></div>
            })}
          </div>
        </div>
      </div>
    }
    
    {group.children && group.children.length > 0 && group.parameters.length === 0 && group.children.map((child, idx) => {
      return <ParameterGroup key={idx} group={child} updateSelectedParameter={setOffCanvasParameter} />
    })}
  </>);
}

export default ParameterGroup; 