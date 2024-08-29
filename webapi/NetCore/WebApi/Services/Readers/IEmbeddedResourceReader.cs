namespace WebApi.Services.Readers;

public interface IEmbeddedResourceReader
{
    public Stream? GetStream(string resource);
    public StreamReader? GetStreamReader(string resource);
    public string? GetString(string resource);
    public Task<string?> GetStringAsync(string resource);
}
