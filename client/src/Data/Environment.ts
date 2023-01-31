import ParameterStoreService from "../Services/ParameterStoreService";
import { getCurrentAppSettings } from "./Model/AppSettings";
import { getAppSettingsContainer } from "./Model/AppSettingsContainer";

class Environment {
  public static baseUrl = process.env.REACT_APP_apiBaseUrl!;
  public static defaultTemplate = '';
  public static awsAccessKeyId = '';
  public static awsAccessKeySecret = '';
  public static awsRegion = '';
  private static rawParameterStoreAllowedPrefixes: string = '/';
  public static parameterStoreAllowedPrefixes = [...new Set([...this.rawParameterStoreAllowedPrefixes?.split(','), '/'])] ?? ['/'];
  private static rawParameterStoreHiddenPatterns: string = '/EnvExplorer/';
  public static parameterStoreHiddenPatterns = [...new Set([...this.rawParameterStoreHiddenPatterns?.split(','), '/EnvExplorer/'])] ?? ['/EnvExplorer/'];

  public static __initialize() {
    const appSettings = getCurrentAppSettings();
    this.defaultTemplate = appSettings?.template ?? this.defaultTemplate;
    this.awsAccessKeyId = appSettings?.awsAccessKeyId;
    this.awsAccessKeySecret = appSettings?.awsAccessKeySecret;
    this.awsRegion = appSettings?.awsRegion;
    this.rawParameterStoreAllowedPrefixes = appSettings?.rawParameterStoreAllowedPrefixes;
    this.rawParameterStoreHiddenPatterns = appSettings?.rawParameterStoreHiddenPatterns;
  }

  public static templateOptions = () => {
    return this.defaultTemplate.split('/')
      .filter(x => x.indexOf('{') > -1 && x.indexOf('}') > -1)
      .map(x => x.replaceAll('{', '').replaceAll('}', ''))
  }

  public static templateValuesFromPrefix = (prefix: string) => {
    const templateValues : Record<string, string> = {};
    const templateOptions = this.defaultTemplate.split('/').map((x, idx) => ({pos: idx, value: x }))
      .filter(x => x.value.indexOf('{') > -1 && x.value.indexOf('}') > -1)
      .map(x => ({...x, value: x.value.replaceAll('{', '').replaceAll('}', '')}));
    templateOptions.forEach(x => templateValues[x.value] = prefix.split('/')[x.pos]);
    return templateValues;
  };

  public static getSelectedTemplatePrefix = (selectedOptions: Record<string, string>) => {
    const opts = this.templateOptions();
    let template = this.defaultTemplate.endsWith('/*') ? this.defaultTemplate.substring(0, this.defaultTemplate.length-2) : this.defaultTemplate;
    opts.forEach(x => template = selectedOptions[x] && template.replaceAll(`{${x}}`, selectedOptions[x]));
    return template;
  }

  public static removeTemplate = (name: string) => {
    const template = this.defaultTemplate.endsWith('/*') ? this.defaultTemplate.substring(0, this.defaultTemplate.length-2) : this.defaultTemplate;
    return name.split('/').filter((_, idx) => idx >= template.split('/').length).join('/');
  }
  
  public static getEnvFileParameter = (name: string, value: string) => {
    value = value.indexOf(' ') > 0 ? `"${value}"` : value;
    return `${this.removeTemplate(name).replaceAll('/', '__')}=${value}`;
  }
}
Environment.__initialize();

export default Environment;