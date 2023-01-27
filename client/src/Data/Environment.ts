class Environment {
  public static readonly baseUrl = process.env.REACT_APP_apiBaseUrl!;
  public static readonly defaultTemplate = process.env.REACT_APP_defaultTemplate!;

  public static templateOptions = () => {
    return this.defaultTemplate.split('/')
      .filter(x => x.length > 1 && x.indexOf('{') > -1 && x.indexOf('}') > -1)
      .map(x => x.replaceAll('{', '').replaceAll('}', ''))
  }

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
    value = value.indexOf(' ') > 0 ? `\"${value}\"` : value;
    return `${this.removeTemplate(name).replaceAll('/', '__')}=${value}`;
  }
}

export default Environment;