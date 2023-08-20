using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;
using webapi.Configurations;
using webapi.Helpers.Readers;
using webapi.Middlewares;
using webapi.Models.Security;
using webapi.Services.Email;
using static webapi.Helpers.Waiter;

Console.WriteLine("Staring WebAPI");

// add router tokens hyphenation
var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.AddControllers(
    options => { options.Conventions.Add(
        new RouteTokenTransformerConvention(new SlugifyParameterTransformer())
        ); 
    }
);

// add logging
Log.Logger = new LoggerConfiguration() // Serilog
    .WriteTo.Console()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", Serilog.Events.LogEventLevel.Warning)
    .CreateLogger();
builder.Host.UseSerilog(); // redirect all log events through Serilog pipeline

// database context(s)
services.AddDbContext<EF_DataContext> (options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("backend_db"))
);



// Identity
services.AddIdentity<AppUser, IdentityRole>(options =>
    options.SignIn.RequireConfirmedAccount = false)
    .AddEntityFrameworkStores<EF_DataContext>()
    .AddDefaultTokenProviders()
    .AddTokenProvider<DataProtectorTokenProvider<AppUser>>("defaultTokenProvider");

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
    options.Tokens.EmailConfirmationTokenProvider = "defaultTokenProvider";
    options.Tokens.PasswordResetTokenProvider = "defaultTokenProvider";

    // Lockout settings.
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings.
    options.User.AllowedUserNameCharacters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = true;
});

builder.Services.ConfigureApplicationCookie(options =>
{
    // Cookie settings
    options.Cookie.Name = "st";
    options.Cookie.HttpOnly = true;
    options.ExpireTimeSpan = TimeSpan.FromMinutes(5);

    options.LoginPath = "/Identity/Account/Login";
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
    options.SlidingExpiration = true;
});
services.AddAuthentication().AddCookie();

// Custom services
services.AddSingleton<IEmailService, AwsSesService>(); // email service
services.AddSingleton<IEmbeddedResourceReader, EmbeddedResourceReader>(); // resources reader

var app = builder.Build();

// run EF migration
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EF_DataContext>();
    Console.WriteLine("Waiting for EF database");
    await WaitForDatabase(db.Database);
    db.Database.Migrate();
}

app.UseSerilogRequestLogging();
app.UseMiddleware<ActionExceptionMiddleware>();
app.UseHttpLogging();
app.UseForwardedHeaders(new ForwardedHeadersOptions() // adds HttpContext.Connection.RemoteIpAddress
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor
});
app.UseAuthentication();
app.MapControllers();
app.UseAuthorization();
Console.WriteLine("Running the WebAPI app");
app.Run();
