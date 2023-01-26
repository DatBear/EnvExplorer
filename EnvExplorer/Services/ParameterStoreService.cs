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
using EnvExplorer.Data.Model.Requests;
using EnvExplorer.Data.Model.Responses;
using FormatWith;

namespace EnvExplorer.Services;

public class ParameterStoreService : IParameterStoreService
{
    private readonly IMapper _mapper;
    private readonly AmazonSimpleSystemsManagementClient _ssmClient;
    private readonly ParameterStoreConfig _psConfig;

    private List<CachedParameter>? _cachedParameters;
    

    private Regex _templatePartRegex = new("\\{(\\w+)\\}");

    public ParameterStoreService(IOptions<AWSConfig> awsConfigOptions, IMapper mapper, IOptions<ParameterStoreConfig> psConfig)
    {
        _mapper = mapper;
        _psConfig = psConfig.Value;
        var awsConfig = awsConfigOptions.Value;
        var credentials = new BasicAWSCredentials(awsConfig.AccessKeyId, awsConfig.AccessKeySecret);
        _ssmClient = new AmazonSimpleSystemsManagementClient(credentials, RegionEndpoint.GetBySystemName(awsConfig.Region));
    }

    public async Task<List<CachedParameter>> RefreshCache()
    {
        var allParameters = await GetAllParameters();
        _cachedParameters = _mapper.Map<List<CachedParameter>>(allParameters);
        return _cachedParameters;
    }

    public async Task<List<CachedParameter>> GetCachedParameters()
    {
        return _cachedParameters ?? await RefreshCache();
    }

    public async Task<CompareParametersResponse> CompareParameters(CompareParametersRequest request)
    {
        var cachedParams = await GetCachedParameters();

        var templateOptions = await GetTemplateOptions(request.Template);
        var compareOptions = templateOptions[request.CompareByOption];
        
        var templatedParams = new List<TemplatedParameterValueResponse>();

        foreach (var opt in compareOptions)
        {
            var baseValues = request.TemplateValues;
            baseValues[request.CompareByOption] = opt;
            var searchTemplatePart = request.Template.FormatWith(baseValues).Replace("/*", string.Empty);
            templatedParams.Add(new TemplatedParameterValueResponse { Name = searchTemplatePart, TemplateValues = new (baseValues) });
        }

        var namePart = templatedParams.Aggregate(request.ParameterName, (a, b) => a.Replace(b.Name, string.Empty)).TrimStart('/');
        templatedParams.ForEach(x =>
        {
            x.Name = $"{x.Name}/{namePart}";
            x.Value = cachedParams.FirstOrDefault(c => c.Name == x.Name)?.Value;
        });
        
        var response = new CompareParametersResponse
        {
            ParameterName = request.ParameterName,
            CompareByOption = request.CompareByOption,
            Parameters = templatedParams
        };
        return response;
    }

    public async Task<List<Parameter>> GetAllParameters()
    {
        var parameters = new List<Parameter>();

        foreach (var prefix in _psConfig.AllowedPrefixesList)
        {
            parameters.AddRange(await GetParameters(prefix));
        }

        return parameters.DistinctBy(x => x.Name).ToList();
    }

    private async Task<List<Parameter>> GetParameters(string path)
    {
        try
        {
            var parameters = new List<Parameter>();
            string token = null;

            do
            {
                var getParametersResponse = await _ssmClient.GetParametersByPathAsync(new GetParametersByPathRequest()
                {
                    Path = path,
                    Recursive = true,
                    WithDecryption = true,
                    NextToken = token
                });
                parameters.AddRange(getParametersResponse.Parameters);
                token = getParametersResponse.NextToken;
            } while (token != null);

            return parameters;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting parameters: {ex}");
        }

        return new List<Parameter>();
    }

    public async Task<ParameterGroupResponse> ListParameters(string template, Dictionary<string, string> templateValues)
    {
        var search = template.FormatWith(templateValues).Replace("/*", "");
        var allParameters = await GetCachedParameters();
        var foundParams = allParameters.Where(x => x.Name.StartsWith(search));

        return await GetGroupedParameters(foundParams);
    }

    public async Task<Dictionary<string, string[]>> GetTemplateOptions(string template)
    {
        var templateOptions = new Dictionary<string, string[]>();
        var allParameters = await GetCachedParameters();

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
        var parameters = cachedParameters?.ToList() ?? await GetCachedParameters();
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

    public async Task<UpdateParameterValueResponse> UpdateParameterValue(UpdateParameterValueRequest request)
    {
        var parameters = await GetCachedParameters();
        try
        {
            var response = await _ssmClient.PutParameterAsync(new PutParameterRequest
            {
                Name = request.Name,
                Value = request.Value,
                Overwrite = true
            });

            parameters.First(x => x.Name == request.Name).Value = request.Value;
        }
        catch (Exception ex)
        {
            return _mapper.Map<UpdateParameterValueResponse>(parameters.FirstOrDefault(x => x.Name == request.Name));
        }

        return new UpdateParameterValueResponse
        {
            Name = request.Name,
            Value = request.Value,
            IsSuccess = true
        };
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