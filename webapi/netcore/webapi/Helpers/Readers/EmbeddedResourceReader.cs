using System.Reflection;

namespace webapi.Helpers.Readers;

public class EmbeddedResourceReader : IEmbeddedResourceReader
{
    private readonly Assembly? _assembly;
    
    public EmbeddedResourceReader()
    {
        _assembly = Assembly.GetEntryAssembly();
    }

    public Stream? GetStream(string resource)
    {
        return _assembly?.GetManifestResourceStream("webapi." + resource);
    }

    public StreamReader? GetStreamReader(string resource)
    {
        var stream = GetStream(resource);
        return stream != null ? new StreamReader(stream) : null;
    }

    public string? GetString(string resource)
    {
        var reader = GetStreamReader(resource);
        return reader?.ReadToEnd();
    }
    
    public async Task<string?> GetStringAsync(string resource)
    {
        var reader = GetStreamReader(resource);
        return await reader.ReadToEndAsync();
    }
}