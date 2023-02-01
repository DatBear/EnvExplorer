import ParameterValueResponse from "./ParameterValueResponse";

type ParameterGroupResponse = {
  total: number;
  name: string;
  allParameters: ParameterValueResponse[];
  children: ParameterGroupResponse[];
  parameters: ParameterValueResponse[];
}

export default ParameterGroupResponse;