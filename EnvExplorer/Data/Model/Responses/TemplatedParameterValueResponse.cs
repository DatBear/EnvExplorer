namespace EnvExplorer.Data.Model.Responses;

public class TemplatedParameterValueResponse
{
    public string Name { get; set; }
    public string? Value { get; set; }
    public string? Type { get; set; }
    public Dictionary<string, string> TemplateValues { get; set; }
}