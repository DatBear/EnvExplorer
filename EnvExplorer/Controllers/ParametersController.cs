using AutoMapper;
using EnvExplorer.Data.Model.Requests;
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

    [HttpPost("file-export")]
    public async Task<IActionResult> FileExport(GetFileExportParametersRequest request)
    {
        var templateParams = await _parameterStoreService.FileExportParameters(request);
        return Ok(templateParams);
    }

    [HttpPost("compare")]
    public async Task<IActionResult> Compare(CompareParametersRequest request)
    {
        var response = await _parameterStoreService.CompareParameters(request);
        return Ok(response);
    }

    [HttpPost("missing")]
    public async Task<IActionResult> Missing(MissingParametersRequest request)
    {
        var response = await _parameterStoreService.MissingParameters(request);
        return Ok(response);
    }

    [HttpPost("update")]
    public async Task<IActionResult> Update(UpdateParameterValueRequest request)
    {
        var response = await _parameterStoreService.UpdateParameterValue(request);
        return response?.IsSuccess ?? false ? Ok(response) : BadRequest(response ?? new UpdateParameterValueResponse { IsSuccess = false });
    }

    [HttpPost("refresh-all")]
    public async Task<IActionResult> RefreshAll()
    {
        var response = await _parameterStoreService.RefreshCache();
        return Ok(response);
    }
}