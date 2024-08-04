using System.Net;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Serilog;
using Serilog.Events;
using WebApi.Configurations;
using WebApi.Controllers.Auth;
using WebApi.Helpers.DataProtection;
using WebApi.Helpers.Readers;
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
        // add logging
        Log.Logger = new LoggerConfiguration() // Serilog
            .WriteTo.Console()
            .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
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
        builder.WebHost.ConfigureKestrel(krestelOptions =>
        {
            var httpPort = GetHttpPort() ?? 10080;
            var httpsPort = 10443;
            
            // listen for HTTP connection
            krestelOptions.Listen(IPAddress.Any, httpPort);
            
            // listen for HTTPS connection
            var isDevelopment = IsDevelopmentEnvironment();
            String domainName = GetDomainName() ?? "fullplate.local";
            String certificate = isDevelopment ? $"../../../nginx/certbot/own_ca_certs/{domainName}.pfx" 
                : $"/own_ca_certs/{domainName}.pfx";
            String password = Environment.GetEnvironmentVariable("BACKEND_PFX_PASSWORD") ?? String.Empty;
            if (File.Exists(certificate) && password != String.Empty)
            {
                krestelOptions.Listen(IPAddress.Any, httpsPort,
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
            .AddEntityFrameworkStores<EntityContext>()
            .AddDefaultTokenProviders()
            .AddTokenProvider<DataProtectorTokenProvider<AppUser>>(TokenProviderName);
        services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.TryAddScoped<AppSignInManager>();
        builder.ConfigureAppIdentity();
    }

    public static void AddAppAuthentication(this IServiceCollection services)
    {
        // Authentication.
        var authenticationBuilder = services.AddAuthentication();
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
    
    public static void AddAppControllers(this IServiceCollection services)
    {
        services.AddControllers(
            options => { options.Conventions.Add(
                    new RouteTokenTransformerConvention(new SlugifyParameterTransformer())
                ); 
            }
        );
    }
    
    public static void AddAppAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy("PermissionsView", 
                policy => policy.RequireClaim("Administration -> User permissions -> view"));
            options.AddPolicy("PermissionsEdit", 
                policy => policy.RequireClaim("Administration -> User permissions -> edit"));
        });
    }
}