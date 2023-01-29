using Amazon;
using Amazon.Runtime;
using Amazon.SimpleSystemsManagement;
using Amazon.SimpleSystemsManagement.Model;
using AutoMapper;
using EnvExplorer.Data.Model;
using EnvExplorer.Data.Model.Requests;
using EnvExplorer.Data.Model.Responses;
using EnvExplorer.Extensions;
using EnvExplorer.Infrastructure.Configurations;
using FormatWith;
using Microsoft.Extensions.Options;
using System.Text.RegularExpressions;

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

    public async Task<List<CachedParameter>> RefreshCache(bool includeHidden = false)
    {
        var allParameters = await GetAllParameters();
        _cachedParameters = _mapper.Map<List<CachedParameter>>(allParameters.OrderBy(x => x.Name));
        _cachedParameters.ForEach(x => x.IsHidden = _psConfig.HiddenParameterPatternsList.Any(p => x.Name.Contains(p)));
        return _cachedParameters.Where(x => includeHidden || !x.IsHidden).ToList();
    }

    private async Task<List<CachedParameter>> GetCachedParameters(bool includeHidden = false)
    {
        return _cachedParameters?.Where(x => includeHidden || !x.IsHidden).ToList() ?? await RefreshCache();
    }

    //only works for templates with max of 2 parameters?
    public async Task<MissingParametersResponse> MissingParameters(MissingParametersRequest request)
    {
        request.Template = request.Template.EndsWith("/*") ? request.Template[..^2] : request.Template;

        var cachedParams = await GetCachedParameters();

        var templateOptions = await GetTemplateOptions(request.Template);
        var missingByValue = request.TemplateValues[request.MissingByOption];
        var missingOptions = templateOptions[request.MissingByOption].Except(new List<string> { missingByValue }).ToList();

        var allMissingParams = new List<MissingParameterResponse>();

        foreach (var opt in templateOptions.Where(x => x.Key != request.MissingByOption))
        {
            foreach (var val in opt.Value)
            {
                var dict = new Dictionary<string, string>();
                dict[opt.Key] = val;
                foreach (var missingOpt in missingOptions)
                {
                    dict[request.MissingByOption] = missingOpt;
                    var otherOption = request.Template.FormatWith(dict);

                    var mainDict = new Dictionary<string, string>(dict);
                    mainDict[request.MissingByOption] = missingByValue;
                    var mainOption = request.Template.FormatWith(mainDict);

                    var otherParams = cachedParams.Where(x => x.Name.StartsWith(otherOption + "/"));
                    var mainParams = cachedParams.Where(x => x.Name.StartsWith(mainOption + "/"));

                    var missingParams = otherParams.Where(op => mainParams.All(mp => op.Name != mp.Name.Replace(mainOption, otherOption)));
                    foreach (var missingParam in missingParams)
                    {
                        var existingMissingParam = allMissingParams.FirstOrDefault(x => x.Name == missingParam.Name.Replace(otherOption, mainOption));
                        if (existingMissingParam == null)
                        {
                            existingMissingParam = new MissingParameterResponse { Name = missingParam.Name.Replace(otherOption, mainOption) };
                            allMissingParams.Add(existingMissingParam);
                        }
                        existingMissingParam.Parameters.Add(new TemplatedParameterValueResponse
                        {
                            Name = missingParam.Name,
                            Value = missingParam.Value,
                            Type = missingParam.Type,
                            TemplateValues = new(dict),
                        });
                    }
                }
            }
        }

        var response = new MissingParametersResponse
        {
            MissingByOption = request.MissingByOption,
            MissingByValue = missingByValue,
            Parameters = allMissingParams.OrderBy(x => x.Name).ToList()
        };
        return response;
    }

    private string RemoveTemplate(string name, string template)
    {
        template = template.EndsWith("/*") ? template[..^2] : template;
        return string.Join("/", name.Split('/').Skip(template.Count(x => x == '/') + 1).ToList());
    }

    public async Task<CompareParametersResponse> CompareParameters(CompareParametersRequest request)
    {
        request.Template = request.Template.EndsWith("/*") ? request.Template[..^2] : request.Template;

        var cachedParams = await GetCachedParameters();

        var templateOptions = await GetTemplateOptions(request.Template);
        var compareOptions = templateOptions[request.CompareByOption];

        var templatedParams = new List<TemplatedParameterValueResponse>();
        var namePart = RemoveTemplate(request.ParameterName, request.Template);

        foreach (var opt in compareOptions)
        {
            var baseValues = request.TemplateValues;
            baseValues[request.CompareByOption] = opt;
            var searchTemplatePart = request.Template.FormatWith(baseValues);
            templatedParams.Add(new TemplatedParameterValueResponse { Name = searchTemplatePart, TemplateValues = new(baseValues) });
        }

        templatedParams.ForEach(x =>
        {
            x.Name = $"{x.Name}/{namePart}";
            var cachedParam = cachedParams.FirstOrDefault(c => c.Name == x.Name);
            x.Type = cachedParam?.Type;
            x.Value = cachedParam?.Value;
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
                var getParametersResponse = await _ssmClient.GetParametersByPathAsync(new GetParametersByPathRequest
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
        var foundParams = allParameters.Where(x => x.Name.StartsWith(search + "/"));

        return foundParams.Any() ? await GetGroupedParameters(foundParams) : new ParameterGroupResponse();
    }

    public async Task<GetFileExportParametersResponse> FileExportParameters(GetFileExportParametersRequest request)
    {
        request.Template = request.Template.EndsWith("/*") ? request.Template[..^2] : request.Template;
        var cachedParams = await GetCachedParameters(true);
        var templateCombos = GetTemplateCombinations(request.Template, request.TemplateValues);
        var files = new List<ExportFileResponse>();
        foreach (var prefix in templateCombos)
        {
            var group = await GetGroupedParameters(cachedParams.Where(x => !x.IsHidden && x.Name.StartsWith(prefix + "/")));
            var path = cachedParams.FirstOrDefault(x => x.Name == $"{prefix}/EnvExplorer/DirectoryName")?.Value;
            if (group != null && path != null)
            {
                var file = new ExportFileResponse
                {
                    Path = path,
                    Parameters = group,
                    Template = prefix
                };
                files.Add(file);
            }
        }

        return new GetFileExportParametersResponse
        {
            Files = files
        };
    }


    private List<string> GetTemplateCombinations(string template, Dictionary<string, string[]> templateOptions)
    {
        //this method is kinda bad but works for now, low volume of total combinations anyways
        var allCombos = ComboExtensions.GetAllPossibleCombos(templateOptions.Select(x => x.Value.Select(v => $"{x.Key}={v}")));
        var allTemplates = new List<string>();
        foreach (var combo in allCombos)
        {
            var dict = new Dictionary<string, string>();
            foreach (var v in combo)
            {
                var split = v.Split("=");
                dict.Add(split[0], split[1]);
            }
            allTemplates.Add(template.FormatWith(dict));
        }

        return allTemplates;
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

    public async Task<ParameterGroupResponse?> GetGroupedParameters(IEnumerable<CachedParameter>? cachedParameters = null)
    {
        var parameters = cachedParameters?.ToList() ?? await GetCachedParameters();
        if (!parameters.Any())
        {
            return null;
        }
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
                parent.Children = parameters.Where(x => x.Name.StartsWith(parent.Name + "/") && NameMaxLevel(x.Name) > i + 1)
                                            .DistinctBy(x => NameLevel(x.Name, i))
                                            .Select(child => new ParameterGroupResponse
                                            {
                                                Name = NameLevel(child.Name, i)
                                            }).ToList();
                parent.Parameters = parameters.Where(x => x.Name.StartsWith(parent.Name + "/"))
                                              .Where(x => NameMaxLevel(x.Name) == i + 1)
                                              .Select(x => new ParameterValueResponse
                                              {
                                                  Name = x.Name,
                                                  Value = x.Value,
                                                  Type = x.Type
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
                Type = ParameterType.FindValue(request.Type),
                Overwrite = true
            });

            var paramExists = parameters.FirstOrDefault(x => x.Name == request.Name);
            if (paramExists != null)
            {
                paramExists.Value = request.Value;
                paramExists.Type = request.Type;
            }
            else
            {
                var newParam = new CachedParameter
                {
                    Name = request.Name,
                    Value = request.Value,
                    Type = request.Type,
                    LastModifiedDate = DateTime.UtcNow
                };
                _cachedParameters.Add(newParam);
            }
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