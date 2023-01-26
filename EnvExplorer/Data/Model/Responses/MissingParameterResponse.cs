namespace EnvExplorer.Data.Model.Responses;

public class MissingParameterResponse
{
    public string Name { get; set; }
    public List<TemplatedParameterValueResponse> Parameters { get; set; } = new();
}