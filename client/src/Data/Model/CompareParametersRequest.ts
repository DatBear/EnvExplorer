type CompareParametersRequest = {
  template: string;
  templateValues: Record<string, string>;
  compareByOption: string;
  parameterName: string;
}

export default CompareParametersRequest;