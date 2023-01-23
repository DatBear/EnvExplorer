import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import ParameterValue from "./ParameterValue";

interface ParameterGroupProps {
  group: ParameterGroupResponse;
}

function ParameterGroup(props: ParameterGroupProps) {
  const getId = (name: string) => {
    return name.replace(/^[^a-z]+|[^\w:.-]+/gi, "");
  }

  const lastName = (name: string) => {
    return name.substring(name.lastIndexOf('/')+1);
  }

  const group = props.group;
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
            {group.parameters.map((param, idx) => <ParameterValue name={param.name} value={param.value} key={idx} />)}
            {group.children.map((child, idx) => {
              return <div className="accordion nested"><ParameterGroup group={child} key={idx} /></div>
            })}
          </div>
        </div>
      </div>
    }
    
    {group.children && group.children.length > 0 && group.parameters.length == 0 && group.children.map((child, idx) => {
      return <ParameterGroup group={child} key={idx} />
    })}
  </>);
}

export default ParameterGroup; 