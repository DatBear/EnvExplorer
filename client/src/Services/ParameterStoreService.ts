import { SSMClient, Parameter, ParameterHistory, PutParameterCommand, paginateGetParameterHistory, paginateGetParametersByPath, GetParametersByPathCommandInput, GetParameterHistoryCommandInput } from "@aws-sdk/client-ssm";
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
import ParameterStoreUpdateEvent, { ProgressUpdateEvent } from "../Data/Events/ParameterStoreUpdateEvent";
import { TypedEvent } from "./TypedEvent";

export default class ParameterStoreService {
  public static instance: ParameterStoreService = new ParameterStoreService();
  public static updateEventEmitter: TypedEvent<ParameterStoreUpdateEvent> = new TypedEvent<ParameterStoreUpdateEvent>();

  private ssmClient!: SSMClient;
  private parameterPrefixes!: string[];
  private hiddenPatterns!: string[];
  private cachedParameters?: CachedParameter[];
  private template!: string;

  private readonly wildcard = '*';
  private readonly templatePartRegex = /\{(\w+)\}/g;//REMEMBER: GLOBAL REGEX STORES STATE

  public __updateEnvironment() {
    this.ssmClient = new SSMClient({
      region: Environment.awsRegion,
      credentials: {
        accessKeyId: Environment.awsAccessKeyId,
        secretAccessKey: Environment.awsAccessKeySecret
      }
    });
    this.parameterPrefixes = Environment.parameterStoreAllowedPrefixes();
    this.hiddenPatterns = Environment.parameterStoreHiddenPatterns();
    this.template = Environment.defaultTemplate.endsWith('/*') ? Environment.defaultTemplate.substring(0, Environment.defaultTemplate.length - 2) : Environment.defaultTemplate;
    this.cachedParameters = undefined;
  }

  private constructor() {
    this.__updateEnvironment();
  }

  private async getAllParameters() {
    const parameters: Parameter[] = [];

    const firstEvent = await this.emitNextUpdateEvent();
    let currentEvent: ParameterStoreUpdateEvent | null = null;
    for (const prefix of this.parameterPrefixes) {
      let response: GetParametersResponse = await this.getParameters(prefix, currentEvent ?? firstEvent);
      currentEvent = response.currentEvent;
      parameters.push(...response.parameters);
    }
    ParameterStoreService.updateEventEmitter.emit({ ...currentEvent!, isComplete: true });
    return parameters;
  }

  private async getNextUpdateEvent(currentEvent?: ParameterStoreUpdateEvent, path?: string, retrieved?: number, isComplete?: boolean): Promise<ParameterStoreUpdateEvent> {
    if (!currentEvent) {
      let prefixes: Record<string, ProgressUpdateEvent> = {};
      this.parameterPrefixes.forEach(x => {
        prefixes[x] = { current: 0, total: this.cachedParameters?.filter(p => p.name.startsWith(x)).length ?? 0, isComplete: false, prefix: x };
      });

      return {
        totalParameters: this.cachedParameters?.length ?? 0,
        parametersRetrieved: 0,
        prefixes,
        isComplete: this.cachedParameters?.length === 0
      };
    }

    if (currentEvent && path && retrieved != null) {
      currentEvent.prefixes[path].current = retrieved;
      currentEvent.prefixes[path].isComplete = isComplete ?? false;
      currentEvent.parametersRetrieved = Object.keys(currentEvent.prefixes)
        .map(x => currentEvent.prefixes[x].current)
        .reduce((t, a) => t + a, 0);
    }

    return currentEvent;
  }

  private async emitNextUpdateEvent(currentEvent?: ParameterStoreUpdateEvent, path?: string, retrieved?: number, isComplete?: boolean) {
    let e = await this.getNextUpdateEvent(currentEvent, path, retrieved, isComplete);
    ParameterStoreService.updateEventEmitter.emit(e);
    return e;
  }

  private async getParameters(prefix: string, currentEvent: ParameterStoreUpdateEvent)
    : Promise<GetParametersResponse> {
    const parameters: Parameter[] = [];

    const commandInput: GetParametersByPathCommandInput = {
      Path: prefix,
      Recursive: true,
      WithDecryption: true
    };

    let nextEvent: ParameterStoreUpdateEvent | null = null;
    var paginator = paginateGetParametersByPath({ client: this.ssmClient }, commandInput);
    for await (const page of paginator) {
      if (page.Parameters) {
        parameters.push(...page.Parameters);
        nextEvent = await this.emitNextUpdateEvent(currentEvent, prefix, parameters.length);
      }
    }

    nextEvent = await this.emitNextUpdateEvent(currentEvent, prefix, parameters.length, true);
    return { parameters, currentEvent: nextEvent ?? currentEvent };
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
      lastModifiedDate: x.LastModifiedDate,
      isHidden: this.hiddenPatterns.find(p => x.Name!.indexOf(p) > -1) != null,
    } as CachedParameter));
    return this.cachedParameters.filter(x => includeHidden || !x.isHidden);
  }

  public async getTemplateOptions(includeWildcard: boolean = false) {
    let templateOptions: Record<string, string[]> = {};
    let allParameters = await this.getCachedParameters();

    let allMatches = [...this.template.matchAll(this.templatePartRegex)];
    allMatches?.forEach(match => {
      let param = match[1];
      let before = this.template.split(param)[0];
      var level = before.split('/').length - 1;
      let options = [...new Set(allParameters.map(x => x.name.split('/')[level]))];
      templateOptions[param] = includeWildcard ? options.concat(this.wildcard) : options;
    });
    return templateOptions;
  }

  public async listParameters(templateValues: Record<string, string>) {
    let searches = await this.templateValueSearches(templateValues);
    let allParameters = await this.getCachedParameters();
    let foundParams = allParameters.filter(x => searches.find(s => x.name.startsWith(s + '/')));
    return foundParams.length ? foundParams.map(x => ({ ...x })) : [] as CachedParameter[];
  }

  public async getParameterGroup(rawTemplateValues: Record<string, string>) {
    let search = this.formatWith(this.template, rawTemplateValues);
    let allParameters = await this.getCachedParameters();
    let foundParams = allParameters.filter(x => x.name.startsWith(search + '/'));
    return foundParams.length ? await this.getGroupedParameters(foundParams) : {} as ParameterGroupResponse;
  }

  private async templateValueSearches(rawTemplateValues: Record<string, string>) {
    let values: Record<string, string[]> = {};
    for (const e of Object.entries(rawTemplateValues)) {
      values[e[0]] = e[1] === this.wildcard ? (await this.getTemplateOptions(false))[e[0]] : [e[1]];
    }
    return this.getTemplateCombinations(values)
  }

  private async getGroupedParameters(cachedParameters: CachedParameter[]) {
    let parameters = cachedParameters ?? await this.getCachedParameters();
    if (parameters.length === 0) {
      return {} as ParameterGroupResponse;
    }

    let maxLevel = Math.max(...parameters.map(x => this.nameMaxLevel(x.name)));
    let i = 1;
    let topLevel = [...new Set(parameters.map(x => this.nameLevel(x.name, i)))]
      .map(x => ({ name: x, total: parameters.length, allParameters: parameters.map(x => ({ ...x }) as ParameterValueResponse) } as ParameterGroupResponse))[0];

    let parentGroup = [topLevel];
    for (i = 2; i <= maxLevel - 1; i++) {
      const a = i;
      if (parentGroup.length === 0) break;
      for (const parent of parentGroup) {
        parent.children = [...new Set(parameters.filter(x => x.name.startsWith(parent.name + '/') && this.nameMaxLevel(x.name) > a + 1).map(x => this.nameLevel(x.name, a)))]
          .map(x => ({ name: this.nameLevel(x, a) } as ParameterGroupResponse));
        parent.parameters = parameters.filter(x => x.name.startsWith(parent.name + '/'))
          .filter(x => this.nameMaxLevel(x.name) === a + 1)
          .map(x => ({ ...x }));
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
    if (paramExists != null) {
      paramExists.value = request.value;
      paramExists.type = request.type;
    } else {
      let newParam: CachedParameter = {
        name: request.name,
        value: request.value,
        type: request.type,
        lastModifiedDate: new Date(),
        isHidden: this.hiddenPatterns.find(p => request.name.indexOf(p) > -1) != null
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
    for (const optKey of Object.keys(templateOptions).filter(x => x !== request.missingByOption)) {
      for (const optVal of templateOptions[optKey]) {
        let dict = {} as Record<string, string>;
        dict[optKey] = optVal;
        for (const missingOpt of missingOptions) {
          dict[request.missingByOption] = missingOpt;
          let otherOption = this.formatWith(this.template, dict);

          let mainDict = { ...dict };
          mainDict[request.missingByOption] = missingByValue;
          let mainOption = this.formatWith(this.template, mainDict);

          let otherParams = cachedParams.filter(x => x.name.startsWith(otherOption + '/'))
          let mainParams = cachedParams.filter(x => x.name.startsWith(mainOption + '/'));

          let missingParams = otherParams.filter(op => mainParams.filter(mp => op.name !== mp.name.replaceAll(mainOption, otherOption)).length === mainParams.length);
          for (const missingParam of missingParams) {
            let existingMissingParam = allMissingParams.find(x => x.name === missingParam.name.replaceAll(otherOption, mainOption));
            if (existingMissingParam == null) {
              existingMissingParam = { name: missingParam.name.replaceAll(otherOption, mainOption) } as MissingParameterResponse;
              allMissingParams.push(existingMissingParam);
            }
            existingMissingParam.parameters = existingMissingParam.parameters ? existingMissingParam.parameters : [];
            existingMissingParam.parameters.push({
              name: missingParam.name,
              value: missingParam.value,
              type: missingParam.type,
              templateValues: { ...dict }
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
    let namePart = this.removeTemplate(request.parameterName);
    const values = { ...request.templateValues, [request.compareByOption]: this.wildcard };
    const searches = await this.templateValueSearches(values);

    let templatedParams = searches.map(x => `${x}/${namePart}`).map(name => {
      let cachedParam = cachedParams.find(c => c.name === name);
      return {
        name,
        type: cachedParam?.type ?? null,
        value: cachedParam?.value ?? null,
        templateValues: Environment.templateValuesFromPrefix(name)
      } as TemplatedParameterValueResponse;
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
    for (const prefix of templateCombos) {
      let group = await this.getGroupedParameters(cachedParams.filter(x => !x.isHidden && x.name.startsWith(prefix + '/')));
      let path = cachedParams.find(x => x.name === `${prefix}/EnvExplorer/DirectoryName`)?.value;
      if (group && path) {
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


  public async getParameterHistory(name: string) {
    const history: ParameterHistory[] = [];
    let token: string | undefined = undefined;

    const commandInput: GetParameterHistoryCommandInput = {
      Name: name,
      NextToken: token,
      WithDecryption: true
    }

    var paginator = paginateGetParameterHistory({ client: this.ssmClient }, commandInput);
    for await (const page of paginator) {
      if (page.Parameters) {
        history.push(...page.Parameters);
      }
    }
    return history;
  }

  private getTemplateCombinations(templateOptions: Record<string, string[]>) {
    let comboInput = Object.keys(templateOptions).map(k => templateOptions[k].map(v => `${k}=${v}`));
    let allCombos = cartesian(...comboInput);
    let allTemplates = [] as string[];


    for (const combo of allCombos) {
      let dict = {} as Record<string, string>;
      for (const v of combo) {
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
    return name.split('/').slice(0, level + 1).join('/');
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
  [P in keyof T]: T[P] extends Array<infer U> ? U : never
}

const cartesian = <T extends any[][]>(...arr: T): MapCartesian<T>[] => {
  return arr.reduce((a, b) => a.flatMap(c => b.map(d => [...c, d])), [[]]) as MapCartesian<T>[];
}

type GetParametersResponse = {
  parameters: Parameter[];
  currentEvent: ParameterStoreUpdateEvent;
}