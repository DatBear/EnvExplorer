namespace EnvExplorer.Extensions;

public static class ComboExtensions
{
    public static IEnumerable<IEnumerable<string>> GetAllPossibleCombos(IEnumerable<IEnumerable<string>> strings)
    {
        //https://stackoverflow.com/a/32572059
        IEnumerable<IEnumerable<string>> combos = new[] { Array.Empty<string>() };
        return strings.Aggregate(combos, (current, inner) => current.SelectMany(_ => inner, (c, i) => c.Append(i)));
    }

    private static IEnumerable<TSource> Append<TSource>(this IEnumerable<TSource> source, TSource item)
    {
        foreach (var element in source)
            yield return element;

        yield return item;
    }
}