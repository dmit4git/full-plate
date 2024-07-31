using static WebApi.E2ETests.Helpers.WebApiHelper;

namespace WebApi.E2ETests.E2ETests.Startup;

[TestFixture, Order(0)]
public class DbStartup
{
    [Test]
    public async Task RunDbStartup()
    {
        await WaitForDatabaseIsUp();
        await RunEntityFrameworkMigrations();
        await ClearDatabase();
    }
}