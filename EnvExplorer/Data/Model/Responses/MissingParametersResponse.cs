namespace EnvExplorer.Data.Model.Responses;

public class MissingParametersResponse
{
    public string MissingByOption { get; set; }
    public string MissingByValue { get; set; }
    public List<MissingParameterResponse> Parameters { get; set; }
}