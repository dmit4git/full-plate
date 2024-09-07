using static WebApi.E2ETests.Helpers.WebApiHelper;

namespace WebApi.E2ETests.E2ETests.Startup;

[TestFixture, Order(0)]
// [Ignore("Native auth has been replaced with SSO (Keycloak)")]
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
