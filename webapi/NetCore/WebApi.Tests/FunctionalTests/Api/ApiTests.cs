using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using WebApi.Helpers.Exceptions;

namespace WebApi.Tests.FunctionalTests.Api;

[TestFixture]
public class ApiTests
{
    [Test]
    public void ErrorSerializationTest()
    {
        // ActionError serialization
        var expectedError = new ActionError("WrongCredentials");
        var errorJson = expectedError.ToJsonString();
        var actualError = ActionError.FromJsonString(errorJson);
        Assert.That(actualError, Is.EqualTo(expectedError));
        // ActionException serialization
        var expectedException = new ActionException("WrongCredentials");
        var exceptionJson = expectedException.ToJsonString();
        var actualException = ActionException.FromJsonString(exceptionJson);
        Assert.That(actualException, Is.EqualTo(expectedException));
    }
    
    [Test]
    public async Task SignInTest()
    {
        // arrange
        var appFactory = new WebApplicationFactory<Program>();
        var appClient = appFactory.CreateClient();
        var body = new { username = "username", password = "password" };
        var stringContent = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        // act
        var response = await appClient.PostAsync("/webapi/auth/sign-in", stringContent);
        var responseString = await response.Content.ReadAsStringAsync();
        var actualException = ActionException.FromJsonString(responseString);
        // assert
        var expectedException = new ActionException("WrongCredentials");
        Assert.That(actualException, Is.EqualTo(expectedException));
    }
}