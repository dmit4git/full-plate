using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using WebApi.Helpers.Exceptions;

namespace WebApi.Tests.FunctionalTests.Api;

[TestFixture]
public class ApiTests
{
    [Test]
    public async Task SignInTest()
    {
        var appFactory = new WebApplicationFactory<Program>();
        var appClient = appFactory.CreateClient();
        var body = new { username = "username", password = "password" };
        var stringContent = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");
        var response = await appClient.PostAsync("/webapi/auth/sign-in", stringContent);
        var responseString = await response.Content.ReadAsStringAsync();
        var actualException = JsonConvert.DeserializeObject<ActionException>(responseString);
        var expectedException = new ActionException("WrongCredentials");
        Assert.That(actualException, Is.EqualTo(expectedException));
    }
}