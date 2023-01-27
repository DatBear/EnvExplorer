using Amazon.SimpleSystemsManagement;

namespace EnvExplorer.Data.Model.Requests;

public class UpdateParameterValueRequest
{
    public string Name { get; set; }
    public string Value { get; set; }
    public string Type { get; set; }
}