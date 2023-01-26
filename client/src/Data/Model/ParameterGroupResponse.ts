import ParameterValueResponse from "./ParameterValueResponse";

type ParameterGroupResponse = {
  name: string;
  children: ParameterGroupResponse[];
  parameters: ParameterValueResponse[];
}

export default ParameterGroupResponse;