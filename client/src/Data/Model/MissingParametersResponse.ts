import MissingParameterResponse from "./MissingParameterResponse";

type MissingParametersResponse = {
  missingByOption: string;
  missingByValue: string;
  parameters: MissingParameterResponse[];
}

export default MissingParametersResponse;