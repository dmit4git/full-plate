using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WebApi.Models.Auth;
using WebApi.Models.Data;
using static WebApi.Helpers.Waiter;

namespace WebApi.E2ETests.Helpers;

public static class WebApiHelper
{
    public static UserManager<AppUser> UserManager { get; }
    private static readonly EntityContext DataContext;
    private static IHost _kestrelHost;

    public static void Initialize()
    {
        
    }

    public static void StartKestrel(IHostBuilder builder)
    {
        builder.ConfigureWebHost(webHostBuilder => webHostBuilder.UseKestrel());
        _kestrelHost = builder.Build();
        _kestrelHost.Start();
    }
    
    static WebApiHelper()
    {
        var appTestFactory = new WebApiE2ETestFactory<Program>();
        var serviceProvider = appTestFactory.Services.CreateScope().ServiceProvider;
        UserManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
        DataContext = serviceProvider.GetRequiredService<EntityContext>();
    }

    public static async Task WaitForDatabaseIsUp()
    {
        Console.WriteLine("Waiting for E2E test EF database");
        await WaitForDatabase(DataContext.Database);
    }
    
    public static async Task RunEntityFrameworkMigrations()
    {
        await DataContext.Database.MigrateAsync();
    }
    
    public static async Task ClearDatabase()
    {
        await DataContext.Users.IgnoreAutoIncludes().ExecuteDeleteAsync();
        await DataContext.RefreshTokens.ExecuteDeleteAsync();
        await DataContext.UserClaims.ExecuteDeleteAsync();
        await DataContext.UserLogins.ExecuteDeleteAsync();
        await DataContext.UserRoles.ExecuteDeleteAsync();
        await DataContext.UserTokens.ExecuteDeleteAsync();
        await DataContext.Roles.ExecuteDeleteAsync();
        await DataContext.RoleClaims.ExecuteDeleteAsync();
    }
}