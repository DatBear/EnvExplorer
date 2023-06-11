import ParameterGroupResponse from '../Data/Model/ParameterGroupResponse';
import ParameterValueResponse from '../Data/Model/ParameterValueResponse';
import { searchFilterGroup, useSearch } from './Contexts/SearchContext';
import ParameterValue from './ParameterValue';
import Accordion from "./Common/Accordion";

type ParameterGroupProps = {
  group: ParameterGroupResponse;
  updateSelectedParameter: (parameter: ParameterValueResponse) => void;
};

function ParameterGroup({ group, updateSelectedParameter: setOffCanvasParameter }: ParameterGroupProps) {
  const { search } = useSearch();

  const lastName = (name: string) => {
    if (name === null) return null;
    return name.substring(name.lastIndexOf('/') + 1);
  };

  const editParameter = (parameter: ParameterValueResponse) => {
    setOffCanvasParameter(parameter);
  };

  return <>
    {group.parameters.length > 0 && searchFilterGroup(search, group) && (
      <Accordion defaultOpen={true}>
        {({ open }) => <>
          <Accordion.Button open={open}>{lastName(group.name)}</Accordion.Button>
          <Accordion.Panel>
            {group.parameters.map((param, idx) => <ParameterValue key={idx} name={param.name} value={param.value} type={param.type} editAction={_ => editParameter(param)} />)}
            {group.children.map((child, idx) => <Accordion key={idx}>
              <ParameterGroup group={child} updateSelectedParameter={setOffCanvasParameter} />
            </Accordion>)}
          </Accordion.Panel>
        </>}
      </Accordion>
    )}
    {group.children && group.children.length > 0 && group.parameters.length === 0 && group.children.map((child, idx) => {
      return <ParameterGroup key={idx} group={child} updateSelectedParameter={setOffCanvasParameter} />;
    })}
  </>
}

export default ParameterGroup;