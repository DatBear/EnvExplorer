class Environment {
  public static readonly baseUrl = process.env.REACT_APP_apiBaseUrl!;
  public static readonly defaultTemplate = process.env.REACT_APP_defaultTemplate!;

  public static templateOptions = () => {
    return this.defaultTemplate.split('/')
      .filter(x => x.length > 1 && x.indexOf('{') > -1 && x.indexOf('}') > -1)
      .map(x => x.replaceAll('{', '').replaceAll('}', ''))
  }

  public static removeTemplate = (name: string) => {
    const template = this.defaultTemplate.endsWith('/*') ? this.defaultTemplate.substring(0, this.defaultTemplate.length-2) : this.defaultTemplate;
    return name.split('/').filter((_, idx) => idx >= template.split('/').length).join('/');
  }
}

export default Environment;