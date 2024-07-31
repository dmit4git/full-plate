using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using WebApi.Tests.FunctionalTests;

namespace WebApi.E2ETests.Helpers;

public class WebApiE2ETestFactory<TProgram> : WebApiTestFactory<TProgram> where TProgram : class
{
    protected override string TestDbName => "e2e_test_db";

    // // Makes the test app start actual Kestrel http server
    // protected override void ConfigureWebHost(IWebHostBuilder builder)
    // {
    //     base.ConfigureWebHost(builder);
    //     builder.UseUrls("http://localhost:11080");
    // }
    // protected override IHost CreateHost(IHostBuilder builder)
    // {
    //     var dummyHost = builder.Build();
    //     WebApiHelper.StartKestrel(builder);
    //     return dummyHost;
    // }
}
