using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
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
        var account = new AccountData 
            { Username = "user_name", Password = "Some_Password_123", Email = "user@some.email"};
        await CreateAppUser(account);
        await SignInWrongUsernameTest();
        await SignInUnconfirmedEmailTest(account);
        await ConfirmUserEmail(account);
        await SignInWrongPasswordTest(account);
        await SignInOkTest(account);
    }

    // Sign-in with wrong username
    public async Task SignInWrongUsernameTest()
    {
        var userBody = new AccountData { Username = "wrong_name", Password = "wrong_password" };
        var response = await SendSignInRequest(userBody);
        var actualException = await ResponseToException(response);
        var expectedException = new ActionException("WrongCredentials");
        Assert.That(actualException, Is.EqualTo(expectedException));
    }

    // Sign-in with wrong password
    public async Task SignInWrongPasswordTest(AccountData account)
    {
        var userBody = new AccountData { Username = account.Username, Password = "wrong_password" };
        var response = await SendSignInRequest(userBody);
        var actualException = await ResponseToException(response);
        var expectedException = new ActionException("WrongCredentials");
        Assert.That(actualException, Is.EqualTo(expectedException));
    }

    public async Task CreateAppUser(AccountData account)
    {
        var user = new AppUser { UserName = account.Username, Email = account.Email };
        var result = await _userManager.CreateAsync(user, account.Password!);
        Assert.IsTrue(result.Succeeded);
    }

    // Sing-in with not confirmed email
    public async Task SignInUnconfirmedEmailTest(AccountData account)
    {
        var response = await SendSignInRequest(account);
        var actualException = await ResponseToException(response);
        var expectedException = new ActionException("EmailNotConfirmed");
        Assert.That(actualException, Is.EqualTo(expectedException));
    }

    public async Task ConfirmUserEmail(AccountData account)
    {
        var user = await _userManager.FindByNameAsync(account.Username!);
        Assert.NotNull(user);
        var confirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user!);
        var result = await _userManager.ConfirmEmailAsync(user!, confirmationToken);
        Assert.IsTrue(result.Succeeded);
    }

    public async Task SignInOkTest(AccountData account)
    {
        var response = await SendSignInRequest(account);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }

    public async Task<HttpResponseMessage> SendSignInRequest(AccountData requestBody)
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