import ParameterGroupResponse from "./ParameterGroupResponse";

type ExportFileResponse = {
  path: string;
  template: string;
  parameters: ParameterGroupResponse;
}

export default ExportFileResponse;