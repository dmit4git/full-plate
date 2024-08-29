namespace WebApi.Helpers.Environment;

public static class EnvironmentHelper
{

    private static string? _keycloakWebAppClientName = null;
    public static string keycloakWebAppClientName =>
        _keycloakWebAppClientName ??= System.Environment.GetEnvironmentVariable("BACKEND_KEYCLOAK_WEBAPP_CLIENT_NAME") ?? "";
    
    private static string? _keycloakHostName = null;
    public static string keycloakHostName =>
        _keycloakHostName ??= System.Environment.GetEnvironmentVariable("BACKEND_KEYCLOAK_HOSTNAME") ?? "";

    public static bool IsDevelopmentEnvironment()
    {
        var aspNetCoreEnvironment = System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "";
        return String.Equals(aspNetCoreEnvironment.ToLower(), "development");
    }
    
    public static bool IsE2ETestEnvironment()
    {
        var aspNetCoreEnvironment = System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "";
        return String.Equals(aspNetCoreEnvironment.ToLower(), "e2etests");
    }
    
    public static string? GetEnvironmentVariable(string variableName)
    {
        string? variable = System.Environment.GetEnvironmentVariable(variableName);
        if (variable == String.Empty)
        {
            variable = null;
        }

        if (variable is not null)
        {
            Console.WriteLine($"EnvironmentHelper has read an environment variable {variableName}={variable}");
        }

        return variable;
    }

    public static string? GetDomainName()
    {
        return GetEnvironmentVariable("NGINX_DOMAIN_NAME");
    }
    
    public static string? GetDbConnectionStringName()
    {
        return GetEnvironmentVariable("BACKEND_DATABASE_CONNECTION_STRING_NAME");
    }
    
    public static string? GetEmailServiceName()
    {
        return GetEnvironmentVariable("BACKEND_EMAIL_SERVICE");
    }
    
    public static int? GetHttpPort()
    {
        string? portString = GetEnvironmentVariable("NGINX_PROXY_HTTP_PORT");
        bool success = Int32.TryParse(portString, out int port);
        if (success)
        {
            return port;
        }
        return null;
    }
}
