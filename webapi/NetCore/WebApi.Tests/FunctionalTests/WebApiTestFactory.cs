using System.Data.Common;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace WebApi.Tests.FunctionalTests;

public class WebApiTestFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var configuration = new ConfigurationBuilder().AddJsonFile("appsettings.Tests.json").Build();
        
        builder.ConfigureServices(services =>
        {
            var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<EF_DataContext>));
            if (dbContextDescriptor is null)
            {
                throw new NullReferenceException("Service descriptor for EF_DataContext was not found");
            }
            services.Remove(dbContextDescriptor);

            var dbConnectionDescriptor = services.SingleOrDefault(
                d => d.ServiceType ==
                     typeof(DbConnection));
            services.Remove(dbConnectionDescriptor);
            
            services.AddSingleton<DbConnection>(container =>
            {
                var connectionString = configuration.GetConnectionString("backend_test_db");
                var connection = new NpgsqlConnection(connectionString);
                connection.Open(); // create open connection so EF won't automatically close it
                return connection;
            });
            
            services.AddDbContext<EF_DataContext>((container, options) =>
            {
                var connection = container.GetRequiredService<DbConnection>();
                options.UseNpgsql(connection);
            });
        });
        
        builder.UseEnvironment("Development");
    }
}