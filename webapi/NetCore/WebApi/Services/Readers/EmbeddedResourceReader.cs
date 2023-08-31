using System.Reflection;
using WebApi.Helpers.Readers;

namespace WebApi.Services.Readers;

public class EmbeddedResourceReader : IEmbeddedResourceReader
{
    private readonly Assembly? _assembly;
    
    public EmbeddedResourceReader()
    {
        _assembly = typeof(Program).Assembly;
    }

    public Stream? GetStream(string resource)
    {
        return _assembly?.GetManifestResourceStream("WebApi." + resource);
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
        return reader is not null ? await reader.ReadToEndAsync() : null;
    }
}
