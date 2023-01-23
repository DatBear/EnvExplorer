namespace EnvExplorer.Infrastructure.Configurations;

public class ParameterStoreConfig
{
    public string? AllowedPrefixes { get; set; }

    public List<string> AllowedPrefixesList => (AllowedPrefixes ?? "/").Split(",").ToList();
}