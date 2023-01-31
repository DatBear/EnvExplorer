import { SSMClient, GetParametersByPathCommand, Parameter, PutParameterCommand } from "@aws-sdk/client-ssm";
import Environment from "../Data/Environment";
import { CachedParameter } from "../Data/Model/CachedParameter";
import CompareParametersRequest from "../Data/Model/CompareParametersRequest";
import CompareParametersResponse from "../Data/Model/CompareParametersResponse";
import ExportFileResponse from "../Data/Model/ExportFileResponse";
import GetFileExportParametersRequest from "../Data/Model/GetFileExportParametersRequest";
import GetFileExportParametersResponse from "../Data/Model/GetFileExportParametersResponse";
import MissingParameterResponse from "../Data/Model/MissingParameterResponse";
import MissingParametersRequest from "../Data/Model/MissingParametersRequest";
import MissingParametersResponse from "../Data/Model/MissingParametersResponse";
import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import ParameterValueResponse from "../Data/Model/ParameterValueResponse";
import TemplatedParameterValueResponse from "../Data/Model/TemplatedParameterValueResponse";
import UpdateParameterValueRequest from "../Data/Model/UpdateParameterValueRequest";
import UpdateParameterValueResponse from "../Data/Model/UpdateParameterValueResponse";

export default class ParameterStoreService {
  public static instance : ParameterStoreService = new ParameterStoreService();

  private readonly ssmClient: SSMClient;
  private readonly parameterPrefixes: string[];
  private cachedParameters?: CachedParameter[];
  private readonly template: string;
  private readonly templatePartRegex = /\{(\w+)\}/g;//REMEMBER: GLOBAL REGEX STORES STATE

  private constructor() {
    this.ssmClient = new SSMClient({ 
      region: Environment.awsRegion, 
      credentials: { 
        accessKeyId: Environment.awsAccessKeyId, 
        secretAccessKey: Environment.awsAccessKeySecret 
      } 
    });
    this.parameterPrefixes = Environment.parameterStoreAllowedPrefixes;
    this.template = Environment.defaultTemplate.endsWith('/*') ? Environment.defaultTemplate.substring(0, Environment.defaultTemplate.length-2) : Environment.defaultTemplate;
  }

  private async getAllParameters() {
    const parameters: Parameter[] = [];
    for(const prefix of this.parameterPrefixes){
      const params = await this.getParameters(prefix);
      params.forEach(x => parameters.push(x));
    }

    return parameters;
  }

  private async getParameters(path: string) {
    const parameters: Parameter[] = [];
    let token: string | undefined = undefined;

    do {
      const command : GetParametersByPathCommand = new GetParametersByPathCommand({ 
        Path: path,
        NextToken: token,
        Recursive: true,
        WithDecryption: true
      });
      const res = await this.ssmClient.send(command);
      if(res.Parameters) {
        res.Parameters.forEach(x => {
          parameters.push(x);
        });
      }
      token = res.NextToken;      
    } while(token);

    return parameters;
  }

  public async getCachedParameters(includeHidden: boolean = false) {
    return this.cachedParameters?.filter(x => includeHidden || !x.isHidden) ?? await this.refreshCache(includeHidden);
  }

  public async refreshCache(includeHidden: boolean = false) {
    const allParameters = await this.getAllParameters();
    allParameters.sort((a, b) => (a.Name! > b.Name!) ? 1 : ((b.Name! > a.Name!) ? -1 : 0));
    this.cachedParameters = allParameters.map(x => ({
      name: x.Name,
      type: x.Type,
      value: x.Value,
      isHidden: false//todo implement later
    } as CachedParameter));
    return this.cachedParameters.filter(x => includeHidden || !x.isHidden);
  }

  public async getTemplateOptions() {
    let templateOptions : Record<string, string[]> = {};
    let allParameters = await this.getCachedParameters();

    let allMatches = [...this.template.matchAll(this.templatePartRegex)];
    allMatches?.forEach(match => {
      let param = match[1];
      let before = this.template.split(param)[0];
      var level = before.split('/').length-1;
      let options = [...new Set(allParameters.map(x => x.name.split('/')[level]))];
      templateOptions[param] = options;
    });

    return templateOptions;
  }

  public async listParameters(templateValues: Record<string, string>) {
    let search = this.formatWith(this.template, templateValues);
    let allParameters = await this.getCachedParameters();
    let foundParams = allParameters.filter(x => x.name.startsWith(search + '/'));
    return foundParams.length ? await this.getGroupedParameters(foundParams) : {} as ParameterGroupResponse;
  }

  private async getGroupedParameters(cachedParameters: CachedParameter[]) {//private
    let parameters = cachedParameters ?? await this.getCachedParameters();
    if(parameters.length === 0){
      return {} as ParameterGroupResponse;
    }

    let maxLevel = Math.max(...parameters.map(x => this.nameMaxLevel(x.name)));
    let i = 1;
    let topLevel = [...new Set(parameters.map(x => this.nameLevel(x.name, i)))]
      .map(x => ({ name: x } as ParameterGroupResponse))[0];
    
    let parentGroup = [topLevel];
    for(i = 2; i <= maxLevel-1; i++) {
      if(parentGroup.length === 0) break;
      for(const parent of parentGroup) {
        parent.children = [...new Set(parameters.filter(x => x.name.startsWith(parent.name + '/') && this.nameMaxLevel(x.name) > i+1).map(x => this.nameLevel(x.name, i)))]
          .map(x => ({ name: this.nameLevel(x, i)} as ParameterGroupResponse));
        parent.parameters = parameters.filter(x => x.name.startsWith(parent.name+'/'))
          .filter(x => this.nameMaxLevel(x.name) === i + 1)
          .map(x => ({ name: x.name, value: x.value, type: x.type } as ParameterValueResponse));
      }
      parentGroup = parentGroup.flatMap(x => x.children).filter(x => x != null);
    }
    return topLevel;
  }

  private async updateParameterValue(request: UpdateParameterValueRequest) {
    let parameters = await this.getCachedParameters();
    await this.ssmClient.send(new PutParameterCommand({
      Name: request.name,
      Value: request.value,
      Type: request.type,
      Overwrite: true
    }));

    let paramExists = parameters.find(x => x.name === request.name);
    if(paramExists != null) {
      paramExists.value = request.value;
      paramExists.type = request.type;
    } else {
      let newParam : CachedParameter = {
        name: request.name,
        value: request.value,
        type: request.type,
        lastModifiedDate: new Date(),
        isHidden: false//todo fix
      };
      this.cachedParameters?.push(newParam);
    }
    return {
      name: request.name,
      value: request.value,
      isSuccess: true
    } as UpdateParameterValueResponse;
  }

  public async saveParameterValue(name: string, value: string, type: string | null) {
    let request = {
      name, value, type
    } as UpdateParameterValueRequest;
    return await this.updateParameterValue(request);
  }

  //only works for templates with max of 2 parameters?
  public async missingParameters(request: MissingParametersRequest) {
    let cachedParams = await this.getCachedParameters();
    
    let templateOptions = await this.getTemplateOptions();
    let missingByValue = request.templateValues[request.missingByOption];
    let missingOptions = templateOptions[request.missingByOption].filter(x => x !== missingByValue);

    let allMissingParams = [] as MissingParameterResponse[];
    for(const optKey of Object.keys(templateOptions).filter(x => x !== request.missingByOption)) {
      for(const optVal of templateOptions[optKey]) {
        let dict = {} as Record<string, string>;
        dict[optKey] = optVal;
        for(const missingOpt of missingOptions) {
          dict[request.missingByOption] = missingOpt;
          let otherOption = this.formatWith(this.template, dict);

          let mainDict = {...dict};
          mainDict[request.missingByOption] = missingByValue;
          let mainOption = this.formatWith(this.template, mainDict);
  
          let otherParams = cachedParams.filter(x => x.name.startsWith(otherOption+'/'))
          let mainParams = cachedParams.filter(x => x.name.startsWith(mainOption+'/'));
  
          let missingParams = otherParams.filter(op => mainParams.filter(mp => op.name !== mp.name.replaceAll(mainOption, otherOption)).length === mainParams.length);
          for(const missingParam of missingParams) {
            let existingMissingParam = allMissingParams.find(x => x.name === missingParam.name.replaceAll(otherOption, mainOption));
            if(existingMissingParam == null){
              existingMissingParam = { name: missingParam.name.replaceAll(otherOption, mainOption) } as MissingParameterResponse;
              allMissingParams.push(existingMissingParam);
            }
            existingMissingParam.parameters = existingMissingParam.parameters ? existingMissingParam.parameters : [];
            existingMissingParam.parameters.push({
              name: missingParam.name,
              value: missingParam.value,
              type: missingParam.type,
              templateValues: {...dict}
            } as TemplatedParameterValueResponse);
          }
        }
      }
    }

    let response = {
      missingByOption: request.missingByOption,
      missingByValue: missingByValue,
      parameters: allMissingParams.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    } as MissingParametersResponse;
    return response;
  }

  public async compareParameters(request: CompareParametersRequest) {
    let cachedParams = await this.getCachedParameters();

    let templateOptions = await this.getTemplateOptions();    
    let compareOptions = templateOptions[request.compareByOption];

    let templatedParams = [] as TemplatedParameterValueResponse[];
    let namePart = this.removeTemplate(request.parameterName);

    for(const opt of compareOptions) {
      let baseValues = request.templateValues;
      baseValues[request.compareByOption] = opt;
      let searchTemplatePart = this.formatWith(this.template, baseValues);
      templatedParams.push({ name: searchTemplatePart, templateValues: {...baseValues} } as TemplatedParameterValueResponse);
    }

    templatedParams.forEach(x => {
      x.name = `${x.name}/${namePart}`;
      let cachedParam = cachedParams.find(c => c.name === x.name);
      x.type = cachedParam?.type ?? null;//change type here?
      x.value = cachedParam?.value ?? null;//change type here?
    });

    let response = {
      parameterName: request.parameterName,
      compareByOption: request.compareByOption,
      parameters: templatedParams
    } as CompareParametersResponse;
    return response;
  }

  public async getFileExport(request: GetFileExportParametersRequest) {
    let cachedParams = await this.getCachedParameters(true);
    let templateCombos = this.getTemplateCombinations(request.templateValues);
    let files = [] as ExportFileResponse[];
    for(const prefix of templateCombos) {
      let group = await this.getGroupedParameters(cachedParams.filter(x => !x.isHidden && x.name.startsWith(prefix+'/')));
      let path = cachedParams.find(x => x.name === `${prefix}/EnvExplorer/DirectoryName`)?.value;
      if(group && path) {
        let file = {
          path: path,
          parameters: group,
          template: prefix
        } as ExportFileResponse;
        files.push(file);
      }
    }
    return { files: files } as GetFileExportParametersResponse;
  }

  private getTemplateCombinations(templateOptions: Record<string, string[]>) {
    let comboInput = Object.keys(templateOptions).map(k => templateOptions[k].map(v => `${k}=${v}`));
    let allCombos = cartesian(...comboInput);
    let allTemplates = [] as string[];

    
    for(const combo of allCombos) {
      let dict = {} as Record<string, string>;
      for(const v of combo) {
          let split = v.split('=');
          dict[split[0]] = split[1];
      }
      allTemplates.push(this.formatWith(this.template, dict));
    }
    return allTemplates;
  }

  private removeTemplate(name: string) {
    return name.split('/').slice(this.template.split('/').length).join('/');
  }

  private nameMaxLevel(name: string) {
    return name.split('/').length;
  }

  private nameLevel(name: string, level: number) {
    return name.split('/').slice(0, level+1).join('/');
  }

  private formatWith(template: string, values: Record<string, string>) {
    let formatted = template;
    let allMatches = [...this.template.matchAll(this.templatePartRegex)];
    allMatches.forEach(m => {
      let param = m[0];
      formatted = formatted.replaceAll(param, values[m[1]]);
    });

    return formatted;
  }
}


type MapCartesian<T extends any[][]> = {
  [P in keyof T]: T[P] extends Array<infer U>? U: never
}

const cartesian = <T extends any[][]>(...arr: T): MapCartesian<T>[] =>
  arr.reduce(
    (a, b) => a.flatMap(c => b.map(d => [...c, d] )),
    [[]] 
) as MapCartesian<T>[];