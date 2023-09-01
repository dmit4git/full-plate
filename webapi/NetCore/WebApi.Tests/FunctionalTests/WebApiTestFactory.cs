using System.Data.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using WebApi.Services.Email;
using WebApi.Tests.Mocks;

namespace WebApi.Tests.FunctionalTests;

public class WebApiTestFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Tests.json").Build();
        
        builder.ConfigureServices(services =>
        {
            ReplaceDatabaseConnection(services, configuration);
            ReplaceEmailService(services);
        });
        
        builder.UseEnvironment("Development");
    }

    // replaces prod database connection with test database connection
    private void ReplaceDatabaseConnection(IServiceCollection services, IConfigurationRoot configuration)
    {
        var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<EF_DataContext>));
        if (dbContextDescriptor is null)
        {
            throw new NullReferenceException("Service descriptor for EF_DataContext was not found.");
        }
        services.Remove(dbContextDescriptor);

        var dbConnectionDescriptor = services.SingleOrDefault(
            d => d.ServiceType == typeof(DbConnection));
        if (dbConnectionDescriptor is not null)
        {
            services.Remove(dbConnectionDescriptor);
        }
        
        services.AddSingleton<DbConnection>(container =>
        {
            var connectionString = configuration.GetConnectionString("backend_test_db");
            var connection = new NpgsqlConnection(connectionString);
            return connection;
        });
        
        services.AddDbContext<EF_DataContext>((container, options) =>
        {
            var connection = container.GetRequiredService<DbConnection>();
            options.UseNpgsql(connection);
        });
    }

    // replace AwsSesService with FakeAwsSesService to test verification url
    private void ReplaceEmailService(IServiceCollection services)
    {
        var dbConnectionDescriptor = services.SingleOrDefault(
            d => d.ServiceType == typeof(IEmailService));
        if (dbConnectionDescriptor is not null)
        {
            services.Remove(dbConnectionDescriptor);
        }
        services.AddSingleton<IEmailService, FakeAwsSesService>();
    }
}