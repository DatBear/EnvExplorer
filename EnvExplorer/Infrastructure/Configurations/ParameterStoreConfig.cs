namespace EnvExplorer.Infrastructure.Configurations;

public class ParameterStoreConfig
{
    public string? AllowedPrefixes { get; set; }

    public List<string> AllowedPrefixesList => (AllowedPrefixes ?? "/").Split(",").Select(x => x.Trim()).ToList();
    public string? HiddenParameterPatterns { get; set; }
    public List<string> HiddenParameterPatternsList => (HiddenParameterPatterns ?? "/EnvExplorer/").Split(",").Select(x => x.Trim()).ToList();
}