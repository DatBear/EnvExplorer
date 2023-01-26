import Environment from "../Data/Environment";
import CompareParametersRequest from "../Data/Model/CompareParametersRequest";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";
import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import UpdateParameterValueResponse from "../Data/Model/UpdateParameterValueResponse";

export default class ParameterApiService {
  private get<T>(url: string): Promise<T> {
    return fetch(url).then(res => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    });
  }

  private post<T>(url: string, body: any): Promise<T> {
    return fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(res => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    });
  }

  getTemplateOptions(template: string | null = null) {
    var url = `${Environment.baseUrl}/parameters/templateOptions?template=${template ?? Environment.defaultTemplate}`;
    return this.get<Record<string, string[]>>(url);
  }

  getGroupedParameters(template: string | null = null, templateValues: Record<string, string>) {
    var url = `${Environment.baseUrl}/parameters/list?template=${template ?? Environment.defaultTemplate}`;
    return this.post<ParameterGroupResponse>(url, templateValues);
  }

  saveParameterValue(name: string, value: string) {
    var url = `${Environment.baseUrl}/parameters/update`;
    return this.post<UpdateParameterValueResponse>(url, { name, value });
  }

  compareParameters(request: CompareParametersRequest) {
    var url = `${Environment.baseUrl}/parameters/compare`;
    return this.post<CompareParametersResponse>(url, request);
  }

  refreshAllParameters() {
    var url = `${Environment.baseUrl}/parameters/refresh-all`;
    return this.post(url, null);
  }
}