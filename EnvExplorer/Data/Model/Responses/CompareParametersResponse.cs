namespace EnvExplorer.Data.Model.Responses;

public class CompareParametersResponse
{
    public string ParameterName { get; set; }
    public string CompareByOption { get; set; }
    public List<TemplatedParameterValueResponse> Parameters { get; set; }
}