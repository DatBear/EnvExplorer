using Amazon.Runtime;
using Amazon.SimpleSystemsManagement;
using EnvExplorer.Infrastructure.Configurations;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text.RegularExpressions;
using Amazon;
using Amazon.SimpleSystemsManagement.Model;
using AutoMapper;
using EnvExplorer.Data.Model;
using EnvExplorer.Data.Model.Responses;
using FormatWith;

namespace EnvExplorer.Services;

public class ParameterStoreService : IParameterStoreService
{
    private readonly IMapper _mapper;
    private readonly AmazonSimpleSystemsManagementClient _ssmClient;

    private List<CachedParameter>? _cachedParameters;

    private Regex _templatePartRegex = new("\\{(\\w+)\\}");

    public ParameterStoreService(IOptions<AWSConfig> awsConfig, IMapper mapper)
    {
        _mapper = mapper;
        var awsConfig1 = awsConfig.Value;
        var credentials = new BasicAWSCredentials(awsConfig1.AccessKeyId, awsConfig1.AccessKeySecret);
        _ssmClient = new AmazonSimpleSystemsManagementClient(credentials, RegionEndpoint.GetBySystemName(awsConfig1.Region));
    }

    public async Task<List<CachedParameter>> RefreshCache()
    {
        var allParameters = await GetAllParameters();
        _cachedParameters = _mapper.Map<List<CachedParameter>>(allParameters);
        return _cachedParameters;
    }

    public async Task<List<Parameter>> GetAllParameters()
    {
        var parameters = new List<Parameter>();
        string token = null;
        do
        {
            var getParametersResponse = await _ssmClient.GetParametersByPathAsync(new GetParametersByPathRequest()
            {
                Path = "/",
                Recursive = true,
                WithDecryption = true,
                NextToken = token
            });
            parameters.AddRange(getParametersResponse.Parameters);
            token = getParametersResponse.NextToken;
        } while (token != null);

        return parameters.DistinctBy(x => x.Name).ToList();
    }

    public async Task<ParameterGroupResponse> ListParameters(string template, Dictionary<string, string> templateValues)
    {
        var search = template.FormatWith(templateValues).Replace("/*", "");
        var allParameters = _cachedParameters ?? await RefreshCache();
        var foundParams = allParameters.Where(x => x.Name.StartsWith(search));

        return await GetGroupedParameters(foundParams);
    }

    public async Task<Dictionary<string, string[]>> GetTemplateOptions(string template)
    {
        var templateOptions = new Dictionary<string, string[]>();
        var allParameters = _cachedParameters ?? await RefreshCache();

        template = template.Replace("/*", "");
        var matches = _templatePartRegex.Matches(template);
        foreach (var match in matches)
        {
            var param = match.ToString().Replace("{", "").Replace("}", "");
            var before = template.Split(param)[0];
            var level = before.Count(x => x == '/');
            var options = allParameters.Select(x => x.Name.Split('/')[level]).Distinct().ToArray();
            templateOptions[param] = options;
        }

        return templateOptions;
    }

    public async Task<ParameterGroupResponse> GetGroupedParameters(IEnumerable<CachedParameter>? cachedParameters = null)
    {
        var parameters = cachedParameters?.ToList() ?? _cachedParameters ?? await RefreshCache();
        var maxLevel = parameters.Max(x => x.Name.Split('/').Length);
        var i = 1;
        var topLevel = parameters.DistinctBy(x => NameLevel(x.Name, i)).Select(x => new ParameterGroupResponse()
        {
            Name = NameLevel(x.Name, i)
        }).FirstOrDefault();

        var parentGroup = new List<ParameterGroupResponse> { topLevel };

        for (i = 2; i <= maxLevel - 1; i++)
        {
            if (parentGroup == null) break;
            foreach (var parent in parentGroup)
            {
                parent.Children = parameters.Where(x => x.Name.StartsWith(parent.Name) && NameMaxLevel(x.Name) > i + 1)
                                            .DistinctBy(x => NameLevel(x.Name, i))
                                            .Select(child => new ParameterGroupResponse
                                            {
                                                Name = NameLevel(child.Name, i)
                                            }).ToList();
                parent.Parameters = parameters.Where(x => x.Name.StartsWith(parent.Name))
                                              .Where(x => NameMaxLevel(x.Name) == i + 1)
                                              .Select(x => new ParameterValueResponse
                                              {
                                                  Name = x.Name,
                                                  Value = x.Value
                                              }).ToList();
            }
            parentGroup = parentGroup.Where(x => x.Children != null).SelectMany(x => x.Children).ToList();
        }

        return topLevel;
    }

    private int NameMaxLevel(string name)
    {
        return name.Split('/').Length;
    }

    private string NameLevel(string name, int level)
    {
        return string.Join("/", name.Split('/').Take(level + 1));
    }
}