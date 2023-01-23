import ParameterValueResponse from "./ParameterValueResponse";

export default class ParameterGroupResponse {
    name!: string;
    children!: ParameterGroupResponse[];
    parameters!: ParameterValueResponse[];
}