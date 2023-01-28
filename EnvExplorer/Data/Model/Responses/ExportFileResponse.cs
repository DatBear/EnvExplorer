namespace EnvExplorer.Data.Model.Responses;

public class ExportFileResponse
{
    public string Path { get; set; }
    public string Template { get; set; }
    public ParameterGroupResponse Parameters { get; set; }
}