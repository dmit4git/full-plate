using System.Data.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using WebApi.Models.Data;
using WebApi.Services.Email;

namespace WebApi.Tests.FunctionalTests;

public class WebApiTestFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected virtual string TestDbName => "backend_test_db";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
        
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
                d => d.ServiceType == typeof(DbContextOptions<EntityContext>));
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
            var connectionString = configuration.GetConnectionString(TestDbName);
            var connection = new NpgsqlConnection(connectionString);
            return connection;
        });
        
        services.AddDbContext<EntityContext>((container, options) =>
        {
            var connection = container.GetRequiredService<DbConnection>();
            options.UseNpgsql(connection);
        });
    }

    // replace AwsSesService with FakeAwsSesService to test verification url
    private void ReplaceEmailService(IServiceCollection services)
    {
        var emailServiceDescriptor = services.SingleOrDefault(
            d => d.ServiceType == typeof(IEmailService));
        if (emailServiceDescriptor is not null)
        {
            services.Remove(emailServiceDescriptor);
        }
        services.AddSingleton<IEmailService, FakeAwsSesService>();
    }
}