namespace EnvExplorer.Data.Model.Responses;

public class ParameterGroupResponse
{
    public string Name { get; set; }
    public List<ParameterValueResponse> Parameters { get; set; }
    public List<ParameterGroupResponse> Children { get; set; }
}