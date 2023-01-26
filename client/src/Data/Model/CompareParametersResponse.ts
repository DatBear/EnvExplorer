import TemplatedParameterValueResponse from "./TemplatedParameterValueResponse";

type CompareParametersResponse = {
  parameterName: string;
  compareByOption: string;
  parameters: TemplatedParameterValueResponse[];
}

export default CompareParametersResponse;