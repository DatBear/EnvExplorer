import { Parameter } from "@aws-sdk/client-ssm";
import Environment from "../Data/Environment";
import ExportFileResponse from "../Data/Model/ExportFileResponse";
import ParameterGroupResponse from "../Data/Model/ParameterGroupResponse";
import ScriptGenerationOptions from "../Data/Model/ScriptGenerationOptions";
import UploadedFile from "../Data/Model/UploadedFile";

export default class FileService {

  public generateScript = (files: ExportFileResponse[], opt: ScriptGenerationOptions) => {
    const envFileName = opt.envFileName ?? '.env';
    let output = '';

    if (!opt.revertOnly) {
      output += '#!/bin/bash\n';
      output += files.map(x => {
        let file = '';
        file += `mkdir -p ${x.path}\n`;
        if (opt.backupLocation) {
          file += `mkdir -p ${opt.backupLocation}/${x.path}\n`;
          file += `cp -R ./${x.path}/${envFileName} ${opt.backupLocation}/${x.path}/${envFileName}\n`;
        }
        const header = opt.includeEnvironmentHeader ? this.getTemplateHeader(Environment.templateValuesFromPrefix(x.template)) : '';
        file += `cat <<EOT >${opt.overwrite ? '' : '>'} ./${x.path}/${envFileName}\n`;
        file += this.generateFile(x.parameters, '', header, '');
        file += 'EOT';
        return file;
      }).join('\n') + '\n';
    }

    output += this.generateRevertScript(files, opt);
    output += opt.selfDestructAfter && !opt.revertOnly ? 'rm $0\n' : '';
    return output;
  }

  private generateRevertScript = (files: ExportFileResponse[], opt: ScriptGenerationOptions) => {
    if (!opt.revertScriptFilePath && !opt.revertOnly) return '';
    const envFileName = opt.envFileName ?? '.env';
    let script = '#!/bin/bash\n';
    script += !opt.revertOnly ? `cat <<EOT > ${opt.revertScriptFilePath}\n` : '';

    script += files.map(x => {
      let file = '';
      file += `mkdir -p ${x.path}\n`;
      file += `cp -R ${opt.backupLocation}/${x.path}/${envFileName} ./${x.path}/${envFileName} \n`;
      return file;
    }).join('\n') + '\n';

    if (opt.selfDestructAfterReverting) {
      script += opt.revertOnly ? 'rm $0\n' : `rm ${opt.revertScriptFilePath}\n`;
    }

    script += !opt.revertOnly ? 'EOT\n' : '';
    return script;
  }

  public generateFile = (group: ParameterGroupResponse, template: string = '', header: string = '', footer: string = '') => {
    return header + this.getFileOutput(group, '') + footer;
  }

  public getTemplateHeader = (templateOptions: Record<string, string>) => {
    return Object.keys(templateOptions).map(x => `#${x}: ${templateOptions[x]}`).join('\n') + '\n\n'
  }

  public getFileName = (templateOptions: Record<string, string>) => {
    return Object.keys(templateOptions).map(x => `${templateOptions[x]}`).join('_') + '.env';
  }

  private getFileOutput = (group: ParameterGroupResponse, current: string = ''): string => {
    return current + group.parameters.map(x => {
      return `${Environment.getEnvFileParameter(x.name, x.value)}\n`;
    }).join('') + group.children.map(x => this.getFileOutput(x)).join('');
  }


  public parseFile(templateOptions: Record<string, string>, content: string) {
    let lines = content.replaceAll('\r', '').split('\n').filter(x => !x.startsWith('#') && x.length > 0 && x.indexOf('=') > -1);
    let prefix = Environment.getSelectedTemplatePrefix(templateOptions);
    let params = lines.map(x => ({
      LastModifiedDate: new Date(),
      Name: `${prefix}/${x.substring(0, x.indexOf('=')).replaceAll('__', '/')}`,
      Value: x.substring(x.indexOf('=') + 1),
    } as Parameter));

    let file: UploadedFile = {
      templateOptions,
      parameters: params
    };

    return file;
  }
}