type MissingParametersResponse = {
  missingByOption: string;
  parameters: MissingParametersResponse[];
}

export default MissingParametersResponse;