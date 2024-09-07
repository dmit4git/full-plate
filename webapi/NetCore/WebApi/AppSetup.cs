using System.Net;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using WebApi.Configurations;
using WebApi.Controllers.Auth;
using WebApi.Helpers.DataProtection;
using WebApi.Helpers.Serializers;
using WebApi.Models.Auth;
using WebApi.Models.Data;
using WebApi.Services.Email;
using WebApi.Services.Readers;
using static WebApi.Helpers.Constants.AppConstants;
using static WebApi.Helpers.Environment.EnvironmentHelper;

namespace WebApi;

public static class AppBuilderSetup {
    public static void AddAppLogging(this WebApplicationBuilder builder)
    {
        LogEventLevel logLevel = String.Equals(LogLevelVariable.ToLower(), "debug") 
            ? LogEventLevel.Debug : LogEventLevel.Warning;
        // add logging
        Log.Logger = new LoggerConfiguration() // Serilog
            .WriteTo.Console()
            .MinimumLevel.Override("Microsoft.AspNetCore", logLevel)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", logLevel)
            .CreateLogger();
        builder.Host.UseSerilog(); // redirect all log events through Serilog pipeline
    }
    
    public static void ConfigureAppIdentity(this WebApplicationBuilder builder)
    {
        builder.Services.Configure<IdentityOptions>(options =>
        {
            // Password settings.
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequireUppercase = true;
            options.Password.RequiredLength = 8;
            options.Password.RequiredUniqueChars = 4;
    
            // Token Providers
            options.Tokens.EmailConfirmationTokenProvider = TokenProviderName;
            options.Tokens.PasswordResetTokenProvider = TokenProviderName;

            // Lockout settings.
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // User settings.
            options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+ ";
            options.User.RequireUniqueEmail = true;
        });
    }
    
    public static void ConfigureKestrel(this WebApplicationBuilder builder)
    {
        builder.WebHost.ConfigureKestrel(kestrelOptions =>
        {
            var httpPort = GetHttpPort() ?? 10080;
            var httpsPort = 10443;
            
            // listen for HTTP connection
            kestrelOptions.Listen(IPAddress.Any, httpPort);
            
            // listen for HTTPS connection
            var isDevelopment = IsDevelopmentEnvironment();
            String domainName = GetDomainName() ?? "fullplate.local";
            String certificate = isDevelopment ? $"../../../nginx/certbot/own_ca_certs/{domainName}.pfx" 
                : $"/own_ca_certs/{domainName}.pfx";
            String password = Environment.GetEnvironmentVariable("BACKEND_PFX_PASSWORD") ?? String.Empty;
            if (File.Exists(certificate) && password != String.Empty)
            {
                kestrelOptions.Listen(IPAddress.Any, httpsPort,
                    listenOptions => { listenOptions.UseHttps(certificate, password); });
            }
        });
    }
}

public static class AppServicesSetup
{
    public static void AddAppDatabaseContext(this IServiceCollection services, WebApplicationBuilder builder)
    {
        string connectionString = GetDbConnectionStringName() ?? "backend_db";
        services.AddDbContext<EntityContext> (options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString(connectionString))
        );
    }

    public static void AddAppIdentity(this IServiceCollection services, WebApplicationBuilder builder)
    {
        services.AddIdentityCore<AppUser>(options =>
                options.SignIn.RequireConfirmedAccount = false)
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<EntityContext>()
            .AddDefaultTokenProviders()
            .AddTokenProvider<DataProtectorTokenProvider<AppUser>>(TokenProviderName);
        services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.TryAddScoped<AppSignInManager>();
        builder.ConfigureAppIdentity();
    }
    
    public static void AddAppControllers(this IServiceCollection services)
    {
        services.AddControllers(
            options => { options.Conventions.Add(
                    new RouteTokenTransformerConvention(new SlugifyParameterTransformer())
                ); 
            }
        );
    }

    public static void AddAppAuthentication(this IServiceCollection services)
    {
        var authenticationBuilder = services.AddAuthentication();
        AddAppNativeAuthentication(services, authenticationBuilder);
        AddAppOidcAuthentication(authenticationBuilder);
    }

    public static void AddAppNativeAuthentication(IServiceCollection services, AuthenticationBuilder authenticationBuilder)
    {
        // Authentication.
        authenticationBuilder.Services.TryAddEnumerable(ServiceDescriptor.Singleton<IPostConfigureOptions<CookieAuthenticationOptions>, PostConfigureCookieAuthenticationOptions>());
        authenticationBuilder.Services.AddOptions<CookieAuthenticationOptions>(OpaqueTokenCookieScheme).Validate((Func<CookieAuthenticationOptions, bool>) (o => !o.Cookie.Expiration.HasValue), "Cookie.Expiration is ignored, use ExpireTimeSpan instead.");
        var cookieAuthenticationOptions = (Action<CookieAuthenticationOptions>)(options =>
        {
            options.Cookie.Name = OpaqueSelfContainedTokenCookieName;
            options.Cookie.HttpOnly = true;
            options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
            options.SlidingExpiration = false;
        });
        authenticationBuilder.AddScheme<CookieAuthenticationOptions, OpaqueTokenCookieAuthenticationHandler>(OpaqueTokenCookieScheme, cookieAuthenticationOptions);
        
        // Helper services.
        if (GetEmailServiceName() == "FakeAwsSesService")
        {
            services.AddSingleton<IEmailService, FakeAwsSesService>();
        }
        else
        {
            services.AddSingleton<IEmailService, AwsSesService>();
        }
        services.AddSingleton<IEmbeddedResourceReader, EmbeddedResourceReader>();
        services.AddSingleton<IDataSerializer<RefreshToken>, JsonDataSerializer<RefreshToken>>();
        services.AddSingleton<IDataProtector, AppDataProtector>();
        services.AddSingleton<ISecureDataFormat<RefreshToken>, RefreshTokenProtector>();
    }

    public static void AddAppOidcAuthentication(AuthenticationBuilder authenticationBuilder)
    {
        // OpenIDConnect authentication.
        authenticationBuilder.AddJwtBearer(options =>
        {
            string realmName = "fullplate";
            string realmRoot = $"https://{KeycloakHostName}/realms/{realmName}";
            options.Authority = realmRoot;
            options.MetadataAddress = realmRoot + "/.well-known/openid-configuration";
            options.RequireHttpsMetadata = false;
            options.TokenValidationParameters = new TokenValidationParameters        
            {            
                NameClaimType = ClaimTypes.Name,
                RoleClaimType = ClaimTypes.Role,
                ValidateLifetime = true,
                ValidateIssuer = true,           
                ValidIssuers = new[] { realmRoot },
                ValidateAudience = true,
                ValidAudiences = new[] { "account", KeycloakWebAppClientName }
            };
        });
    }

    public static void AddAppAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // Authorization with multiple default schemes
            var defaultAuthorizationPolicyBuilder = new AuthorizationPolicyBuilder(
                OpaqueTokenCookieScheme, JwtBearerDefaults.AuthenticationScheme);
            defaultAuthorizationPolicyBuilder = defaultAuthorizationPolicyBuilder.RequireAuthenticatedUser();
            options.DefaultPolicy = defaultAuthorizationPolicyBuilder.Build();
            
            // Native authorization policies
            options.AddPolicy("PermissionsView", 
                policy => policy.RequireClaim("Administration -> User permissions -> view"));
            options.AddPolicy("PermissionsEdit", 
                policy => policy.RequireClaim("Administration -> User permissions -> edit"));
        });
    }
}
