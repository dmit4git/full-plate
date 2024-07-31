using System.Reflection;
using Microsoft.Playwright;

namespace WebApi.E2ETests.Helpers;

public class PlaywrightE2ETest : PlaywrightTest
{
    protected static BrowserNewContextOptions ContextOptions { get; private set; }  = new ()
    {
        BaseURL = "http://localhost/",
        ViewportSize = ViewportSize.NoViewport
    };

    private readonly int _defaultTimeout = 5000; 

    public IBrowser Browser { get; internal set; } = null!;
    public IBrowserContext Context { get; private set; } = null!;
    public IPage Page { get; private set; } = null!;

    [SetUp]
    public async Task BrowserSetup()
    {
        WebApiHelper.Initialize(); // empty call to ensure static class is initialized
        var headed = Environment.GetEnvironmentVariable("HEADED") ?? "";
        var headless = true;
        if (Int32.TryParse(headed , out int headedInt))
        {
            headless = !Convert.ToBoolean(headedInt);
        }
        Browser = await Playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = headless, 
            Args = new[] { "--window-size=1920,1080" },
            Timeout = _defaultTimeout
        });
        Context = await Browser.NewContextAsync(ContextOptions).ConfigureAwait(false);
        Context.SetDefaultTimeout(_defaultTimeout);
        
        // Start tracing
        await Context.Tracing.StartAsync(new()
        {
            Title = $"{TestContext.CurrentContext.Test.ClassName}.{TestContext.CurrentContext.Test.Name}",
            Screenshots = true,
            Snapshots = true,
            Sources = true
        });
        
        Page = await Context.NewPageAsync().ConfigureAwait(false);
    }

    [TearDown]
    public async Task BrowserTearDown()
    {
        var testOk = TestOk();
        TracingStopOptions? tracingStopOptions = null; // traces don't get saved with null options
        if (!testOk)
        {
            var dateTime = DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss");
            var directoryPath = GetProjectDirectory();
            directoryPath = Path.Combine(directoryPath, "Traces");
            Directory.CreateDirectory(directoryPath); 
            var fileName = $"{TestContext.CurrentContext.Test.Name}.{dateTime}.zip";
            var filePath = Path.Combine(directoryPath, fileName);
            tracingStopOptions = new() { Path = filePath };
        }
        await Context.Tracing.StopAsync(tracingStopOptions);
        if (testOk)
        {
            await Context.CloseAsync().ConfigureAwait(false);
        }
        Browser = null!;
    }

    public static string GetProjectDirectory()
    {
        var assemblyName = Assembly.GetCallingAssembly().GetName().Name;
        var directory = Environment.CurrentDirectory;
        while (Path.GetFileName(directory) != assemblyName)
        {
            var parent = Directory.GetParent(directory);
            if (parent is null)
            {
                throw new ArgumentNullException($"directory '{directory}' has no parent");
            }
            directory = parent.ToString();
        }
        return directory;
    }

    protected ILocator GetButtonByName(string name)
    {
        var buttonName = new PageGetByRoleOptions { NameString = name };
        return Page.GetByRole(AriaRole.Button, buttonName);
    }
}