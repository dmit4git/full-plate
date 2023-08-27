using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApi.Controllers.Auth.Dto;
using WebApi.Helpers.Exceptions;
using WebApi.Models.Security;
using static WebApi.Helpers.Waiter;

namespace WebApi.Tests.FunctionalTests.Api;

[TestFixture]
public class ApiTests
{
    private readonly WebApiTestFactory<Program> _appTestFactory;
    private readonly UserManager<AppUser> _userManager;
    private readonly EF_DataContext _dataContext;

    public ApiTests()
    {
        Console.WriteLine("Starting WebApi factory");
        _appTestFactory = new();
        var serviceProvider = _appTestFactory.Services.CreateScope().ServiceProvider;
        _userManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();
        _dataContext = serviceProvider.GetRequiredService<EF_DataContext>();
    }

    [OneTimeSetUp]
    public async Task OneTimeSetup()
    {
        // run EF migration
        Console.WriteLine("Waiting for test EF database");
        await WaitForDatabase(_dataContext.Database);
        await _dataContext.Database.MigrateAsync();
    }

    [OneTimeTearDown]
    public async Task OneTimeTeardown()
    {
        await ClearDatabase();
    }

    private async Task ClearDatabase()
    {
        await _dataContext.Users.ExecuteDeleteAsync();
        await _dataContext.UserClaims.ExecuteDeleteAsync();
        await _dataContext.UserLogins.ExecuteDeleteAsync();
        await _dataContext.UserRoles.ExecuteDeleteAsync();
        await _dataContext.UserTokens.ExecuteDeleteAsync();
        await _dataContext.Roles.ExecuteDeleteAsync();
        await _dataContext.RoleClaims.ExecuteDeleteAsync();
    }

    [Test]
    public async Task SignInTest()
    {
        // Sign-in with wrong credentials
        var userBody = new SignUpAccount { Username = "wrong_name", Password = "wrong_password" };
        var response = await SendSignInRequest(userBody);
        var actualException = await ResponseToException(response);
        var expectedException = new ActionException("WrongCredentials");
        Assert.That(actualException, Is.EqualTo(expectedException));
        
        // Sing-in with not confirmed email
        var user = new AppUser { UserName = "user_name", Email = "user@some.email" };
        var password = "Some_Password_123!";
        var result = await _userManager.CreateAsync(user, password);
        Assert.IsTrue(result.Succeeded);
        userBody = new SignUpAccount { Username = user.UserName, Password = password };
        response = await SendSignInRequest(userBody);
        actualException = await ResponseToException(response);
        expectedException = new ActionException("EmailNotConfirmed");
        Assert.That(actualException, Is.EqualTo(expectedException));
    }

    public async Task<HttpResponseMessage> SendSignInRequest(SignUpAccount requestBody)
    {
        var appClient = _appTestFactory.CreateClient();
        var jsonBody = JsonSerializer.Serialize(
            new { username = requestBody.Username, password = requestBody.Password });
        var stringContent = new StringContent(jsonBody, Encoding.UTF8, "application/json");
        return await appClient.PostAsync("/webapi/auth/sign-in", stringContent);
    }

    public async Task<ActionException?> ResponseToException(HttpResponseMessage response)
    {
        var responseString = await response.Content.ReadAsStringAsync();
        return ActionException.FromJsonString(responseString);
    }
}