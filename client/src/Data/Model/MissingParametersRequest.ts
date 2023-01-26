type MissingParametersRequest = {
  template: string;
  missingByOption: string;
  templateValues: Record<string, string>;
}

export default MissingParametersRequest;