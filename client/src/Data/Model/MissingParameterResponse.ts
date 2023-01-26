import TemplatedParameterValueResponse from "./TemplatedParameterValueResponse";

type MissingParameterResponse = {
  name: string;
  parameters: TemplatedParameterValueResponse[];
}

export default MissingParameterResponse;