namespace EnvExplorer.Data.Model.Requests;

public class GetFileExportParametersRequest
{
    public string Template { get; set; }
    public Dictionary<string, string[]> TemplateValues { get; set; }
}