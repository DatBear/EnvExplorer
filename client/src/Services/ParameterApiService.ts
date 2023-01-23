import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";

export default class ParameterApiService {
    private baseUrl: string;
    private defaultTemplate: string;

    constructor() {
        this.baseUrl = process.env.REACT_APP_apiBaseUrl!;
        this.defaultTemplate = process.env.REACT_APP_defaultTemplate!;
    }

    private get<T>(url: string) : Promise<T>{
        return fetch(url).then(res => {
            if(!res.ok){
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    private post<T>(url: string, body: string) : Promise<T>{
        return fetch(url, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        }).then(res => {
            if(!res.ok){
                throw new Error(res.statusText);
            }
            return res.json();
        });
    }

    getTemplateOptions(template: string | null = null) {
        var url = `${this.baseUrl}/parameters/templateOptions?template=${template ?? this.defaultTemplate}`;
        return this.get<Map<string, string[]>>(url);
    }

    getGroupedParameters(template: string | null = null, templateValues: Map<string, string>) {
        var url = `${this.baseUrl}/parameters/list?template=${template ?? this.defaultTemplate}`;
        const body = JSON.stringify(templateValues, this.mapReplacer);
        return this.post<ParameterGroupResponse>(url, body);
    }

    mapReplacer(key: string, value: object) {
        if(value instanceof Map) {
            let ret : Record<string, string> = {};
            [...value.keys()].forEach(x => { ret[x] = value.get(x) });
            return ret;
        }
        return value;
    }
}