type ScriptGenerationOptions = {
  revertScriptFilePath?: string | null;
  revertOnly: boolean;
  selfDestructAfterReverting: boolean;
  backupLocation?: string;
  selfDestructAfter: boolean;
  overwrite: boolean;
  includeDateHeader: boolean;
  includeEnvironmentHeader: boolean;
  envFileName?: string | null;
};

export default ScriptGenerationOptions;