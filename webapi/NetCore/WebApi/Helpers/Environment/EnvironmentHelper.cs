namespace WebApi.Helpers.Environment;

public static class EnvironmentHelper
{
    public static bool IsE2ETestEnvironment()
    {
        var aspNetCoreEnvironment = System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "";
        return String.Equals(aspNetCoreEnvironment.ToLower(), "e2etests");
    }
    
    public static bool IsDevelopmentEnvironment()
    {
        var aspNetCoreEnvironment = System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "";
        return String.Equals(aspNetCoreEnvironment.ToLower(), "development");
    }

    public static string? GetDomainName()
    {
        return System.Environment.GetEnvironmentVariable("NGINX_DOMAIN_NAME");
    }
}