using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using WebApi.Helpers.Exceptions;

namespace WebApi.Tests.FunctionalTests.Api;

[TestFixture]
public class ApiTests
{
    // private readonly WebApplicationFactory<Program> _appFactory = new WebApplicationFactory<Program>();

    [Test]
    public async Task SignInTest()
    {
        var appFactory = new WebApplicationFactory<Program>();
        var appClient = appFactory.CreateClient();
        var body = new { username = "user", password = "pass" };
        var stringContent = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");
        var response = await appClient.PostAsync("/webapi/auth/sign-in", stringContent);
        var responseString = await response.Content.ReadAsStringAsync();
        var actionException = JsonConvert.DeserializeObject<ActionException>(responseString);
        Assert.Pass();
    }
}