namespace EnvExplorer.Data.Model.Requests;

public class CompareParametersRequest
{
    public string Template { get; set; }
    public Dictionary<string, string> TemplateValues { get; set; }
    public string CompareByOption { get; set; }
    public string ParameterName { get; set; }
}