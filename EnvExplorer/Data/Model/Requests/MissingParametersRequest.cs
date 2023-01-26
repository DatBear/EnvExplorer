namespace EnvExplorer.Data.Model.Requests;

public class MissingParametersRequest
{
    public string Template { get; set; }
    public Dictionary<string, string> TemplateValues { get; set; }
    public string MissingByOption { get; set; }
}