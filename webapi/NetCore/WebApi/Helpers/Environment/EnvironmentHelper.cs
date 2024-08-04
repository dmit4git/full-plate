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
    
    public static string? GetDbConnectionStringName()
    {
        return System.Environment.GetEnvironmentVariable("BACKEND_DATABASE_CONNECTION_STRING_NAME");
    }
    
    public static string? GetEmailServiceName()
    {
        return System.Environment.GetEnvironmentVariable("BACKEND_EMAIL_SERVICE");
    }
    
    public static int? GetHttpPort()
    {
        string? portString = System.Environment.GetEnvironmentVariable("NGINX_PROXY_HTTP_PORT");
        bool success = Int32.TryParse(portString, out int port);
        if (success)
        {
            return port;
        }
        return null;
    }
}