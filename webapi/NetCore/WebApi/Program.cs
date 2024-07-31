using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Serilog;
using WebApi;
using WebApi.Middlewares;
using WebApi.Models.Data;
using static WebApi.Helpers.Waiter;

Console.WriteLine("Staring WebAPI");

// Add router tokens hyphenation.
var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

// Add services.
builder.AddAppLogging();
// Configure Krestel web server
builder.ConfigureKestrel();

services.AddAppDatabaseContext(builder);
services.AddAppIdentity(builder);
services.AddAppControllers();
services.AddAppAuthentication();
services.AddAppAuthorization();

// Build the app
var app = builder.Build();

// Wait for the database and run EF migration.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EntityContext>();
    Console.WriteLine("Waiting for EF database");
    await WaitForDatabase(db.Database);
    await db.Database.MigrateAsync();
}

app.UseSerilogRequestLogging();
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor // Adds HttpContext.Connection.RemoteIpAddress
});
app.UseAuthentication();
app.MapControllers();
app.UseAuthorization();
app.UseMiddleware<ActionExceptionMiddleware>();
Console.WriteLine("Running the WebAPI app");
app.Run();
