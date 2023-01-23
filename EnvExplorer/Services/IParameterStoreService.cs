using Amazon.SimpleSystemsManagement.Model;
using EnvExplorer.Data.Model;
using EnvExplorer.Data.Model.Responses;

namespace EnvExplorer.Services;

public interface IParameterStoreService
{
    Task<List<ParameterMetadata>> ListParameters();
    Task<ParameterGroupResponse> ListParameters(string template, Dictionary<string, string> templateValues);
    Task<Dictionary<string, string[]>> GetTemplateOptions(string template);
    Task<ParameterGroupResponse> GetGroupedParameters(IEnumerable<CachedParameter>? cachedParameters = null);
}