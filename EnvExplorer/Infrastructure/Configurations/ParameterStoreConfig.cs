namespace EnvExplorer.Infrastructure.Configurations;

public class ParameterStoreConfig
{
    public string? AllowedPrefixes { get; set; }

    public List<string> AllowedPrefixesList => (AllowedPrefixes ?? "/").Split(",").ToList();
    public string? HiddenParameterPatterns { get; set; }
    public List<string> HiddenParameterPatternsList => (HiddenParameterPatterns ?? "EnvExplorer").Split(",").ToList();//todo hide these parameters in lists, exports, etc.
}