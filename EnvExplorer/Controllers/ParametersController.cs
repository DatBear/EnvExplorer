using AutoMapper;
using EnvExplorer.Data.Model.Responses;
using EnvExplorer.Services;
using Microsoft.AspNetCore.Mvc;

namespace EnvExplorer.Controllers;

[ApiController]
[Route("[controller]")]
public class ParametersController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly IParameterStoreService _parameterStoreService;

    public ParametersController(IParameterStoreService parameterStoreService, IMapper mapper)
    {
        _parameterStoreService = parameterStoreService;
        _mapper = mapper;
    }

    [HttpGet("templateOptions")]
    public async Task<IActionResult> GetTemplateOptions([FromQuery] string template)
    {
        var options = await _parameterStoreService.GetTemplateOptions(template);
        return Ok(options);
    }

    [HttpPost("list")]
    public async Task<IActionResult> List([FromQuery] string template, [FromBody] Dictionary<string, string> templateValues)
    {
        if (!string.IsNullOrEmpty(template))
        {
            var templateParams = await _parameterStoreService.ListParameters(template, templateValues);
            return Ok(templateParams);
        }

        var parameters = await _parameterStoreService.GetAllParameters();
        var response = _mapper.Map<List<ParameterMetadataResponse>>(parameters);
        return Ok(response);
    }

    [HttpGet("grouped")]
    public async Task<IActionResult> GetGroupedParameters()
    {
        var groupedParameters = await _parameterStoreService.GetGroupedParameters();
        return Ok(groupedParameters);
    }
}