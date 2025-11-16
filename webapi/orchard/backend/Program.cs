using Microsoft.AspNetCore.HttpOverrides;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

builder.Services.AddOrchardCms();

// Serilog
LogEventLevel logLevel = LogEventLevel.Debug;
Log.Logger = new LoggerConfiguration() // Serilog
    .WriteTo.Console()
    // .MinimumLevel.Debug()
    // .MinimumLevel.Override("Microsoft.AspNetCore", logLevel)
    // .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", logLevel)
    // .MinimumLevel.Override("Microsoft.AspNetCore.Authentication.OpenIdConnect", logLevel)
    // .MinimumLevel.Override("Microsoft.IdentityModel.Protocols.OpenIdConnect", logLevel)
    // .MinimumLevel.Override("OrchardCore", logLevel)
    .CreateLogger();
builder.Host.UseSerilog(); // redirect all log events through Serilog pipeline

// builder.WebHost.ConfigureKestrel(kestrelOptions =>
// {
//     // listen for HTTPS connection
//     String certificate = $"/own_ca_certs/fullplate.local.pfx";
//     // String password = Environment.GetEnvironmentVariable("BACKEND_PFX_PASSWORD") ?? String.Empty;
//     String password = "acs4_FP-TLS";
//     if (File.Exists(certificate) && password != String.Empty)
//     {
//         kestrelOptions.Listen(IPAddress.Any, 15260);
//         kestrelOptions.Listen(IPAddress.Any, 15443,
//             listenOptions => { listenOptions.UseHttps(certificate, password); });
//     }
// });

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost | ForwardedHeaders.XForwardedFor
});

// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

// app.UseAuthorization();

app.UseOrchardCore();

// app.MapControllers();

app.Run();