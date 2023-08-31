using System.Net;
using System.Reflection;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WebApi.Controllers.Auth.Dto;
using WebApi.Helpers.Exceptions;
using WebApi.Models.Security;
using WebApi.Services.Email;
using WebApi.Services.Parsers;
using WebApi.Tests.Mocks;
using static WebApi.Helpers.Waiter;

namespace WebApi.Tests.FunctionalTests.Api.Auth;

[TestFixture]
public class AuthControllerTest
{
    private readonly WebApiTestFactory<Program> _appTestFactory;
    private readonly IServiceProvider _serviceProvider;
    private readonly UserManager<AppUser> _userManager;
    private readonly EF_DataContext _dataContext;

    public AuthControllerTest()
    {
        Console.WriteLine("Starting WebApi factory");
        _appTestFactory = new();
        _serviceProvider = _appTestFactory.Services.CreateScope().ServiceProvider;
        _userManager = _serviceProvider.GetRequiredService<UserManager<AppUser>>();
        _dataContext = _serviceProvider.GetRequiredService<EF_DataContext>();
    }
    
    /* Setup and teardown */

    [OneTimeSetUp]
    public async Task OneTimeSetup()
    {
        // run EF migration
        Console.WriteLine("Waiting for test EF database");
        await WaitForDatabase(_dataContext.Database);
        await _dataContext.Database.MigrateAsync();
    }

    [TearDown]
    public async Task Teardown()
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
    
    /* Sign-up endpoint tests */
    
    [Test]
    public async Task SignUpTest()
    {
        await EmailConfirmationTest();
        var account = new AccountData 
            { Username = "signup_name", Password = "Signup_Password_123", Email = "signup@some.email"};
        var accountData = new AccountDataDto { Account = account, Styles = new Dictionary<string, string>() };
        await SignUpNewUser(accountData);
        await SignUpWithTakenCredentials(accountData);
    }

    // Asserts that private MakeVerificationHtmlBody() of IEmailService implementation
    // generates parseable HTML message body with "Verify Email" link.
    private async Task EmailConfirmationTest()
    {
        var emailService = _serviceProvider.GetRequiredService<IEmailService>();
        // test private method MakeVerificationHtmlBody() of AwsSesService
        var method = typeof(AwsSesService).GetMethod("MakeVerificationHtmlBody", 
            BindingFlags.Instance | BindingFlags.NonPublic);
        Assert.That(method, Is.Not.Null);
        object[] parameters = {"toAddress", "verificationUrl", new Dictionary<string, string>()};
        var emailBody = (string?)method!.Invoke(emailService, parameters) ?? "";
        var htmlDoc = await new AngleSharpParser().Parse(emailBody);
        using var anchorsEnumerator = htmlDoc.All.Where(element => 
            element.GetType().Name == "HtmlAnchorElement" && element.TextContent == "Verify Email").GetEnumerator();
        Assert.True(anchorsEnumerator.MoveNext());
        var anchor = anchorsEnumerator.Current;
        Assert.That(anchor, Is.Not.Null);
        Assert.False(anchorsEnumerator.MoveNext());
        var uri = anchor.BaseUri;
        Assert.That(uri, Is.Not.Null);
    }

    // Asserts user creation and sanity of "Verify Email" link parameters.
    private async Task SignUpNewUser(AccountDataDto accountData)
    {
        var response = await PostRequest("/webapi/auth/sign-up", accountData);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.Created));
        var awsSesService = (FakeAwsSesService)_serviceProvider.GetRequiredService<IEmailService>();
        Assert.That(awsSesService.VerificationUrl, Is.Not.Null);
        var uri = new Uri(awsSesService.VerificationUrl!);
        var query = QueryHelpers.ParseQuery(uri.Query);
        Assert.That(query["overlay"], Is.EqualTo("email-verification"));
        Assert.That(query["email"], Is.EqualTo(accountData.Account!.Email));
        Assert.That(query["username"], Is.EqualTo(accountData.Account!.Username));
        Assert.That(query["email-verification"].FirstOrDefault(""), Is.Not.EqualTo(""));
    }
    
    // Sign-up with username and email that are already taken.
    private async Task SignUpWithTakenCredentials(AccountDataDto accountData)
    {
        var response = await PostRequest("/webapi/auth/sign-up", accountData);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.InternalServerError));
        var actualException = await ResponseToException(response);
        var expectedException = new ActionException(
            new ActionError("DuplicateUserName", "Username 'signup_name' is already taken."),
            new ActionError("DuplicateEmail", "Email 'signup@some.email' is already taken."));
        Assert.That(actualException, Is.EqualTo(expectedException));
    }
    
    /* Sign-in endpoint tests */

    [Test]
    public async Task SignInTest()
    {
        var account = new AccountData 
            { Username = "signin_user", Password = "Signin_Password_123", Email = "signin@some.email"};
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
        var response = await PostRequest("/webapi/auth/sign-in", userBody);
        var actualException = await ResponseToException(response);
        var expectedException = new ActionException("WrongCredentials");
        Assert.That(actualException, Is.EqualTo(expectedException));
    }

    // Sign-in with wrong password
    public async Task SignInWrongPasswordTest(AccountData account)
    {
        var userBody = new AccountData { Username = account.Username, Password = "wrong_password" };
        var response = await PostRequest("/webapi/auth/sign-in", userBody);
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
        var response = await PostRequest("/webapi/auth/sign-in", account);
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

    // Calls sign-in endpoint to log user in. Returns session token obtained from response cookie. 
    public async Task<string> SignInOkTest(AccountData account)
    {
        var response = await PostRequest("/webapi/auth/sign-in", account);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        using var cookies = response.Headers.SingleOrDefault(
            header => header.Key == "Set-Cookie").Value.GetEnumerator();
        Assert.True(cookies.MoveNext());
        Assert.That(cookies.Current, Is.Not.Null);
        Assert.That(cookies.Current, Does.StartWith("st="));
        Assert.That(cookies.Current, Has.Length.GreaterThan(3));
        cookies.Dispose();
        return cookies.Current.Remove(0, 3);
    }

    public async Task<ActionException?> ResponseToException(HttpResponseMessage response)
    {
        var responseString = await response.Content.ReadAsStringAsync();
        return ActionException.FromJsonString(responseString);
    }
    
    /* Sign-out endpoint tests */

    [Test]
    public async Task SignOutTest()
    {
        // create user
        var account = new AccountData 
            { Username = "signout_user", Password = "Signout_Password_123", Email = "signout@some.email"};
        await CreateAppUser(account);
        await ConfirmUserEmail(account);
        // sign-in user
        var token = await SignInOkTest(account);
        var response = await PostRequest("/webapi/auth/sign-in", account);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        // sign-out user
        var cookie = new KeyValuePair<string, string>("st", token);
        response = await PostRequest("/webapi/auth/sign-out", account, cookie);
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }
    
    /* Utilities */
    
    // public async Task<HttpResponseMessage> PostRequest(string endpoint, object requestBody)
    // {
    //     var appClient = _appTestFactory.CreateClient();
    //     var jsonBody = JsonSerializer.Serialize(requestBody);
    //     var stringContent = new StringContent(jsonBody, Encoding.UTF8, "application/json");
    //     return await appClient.PostAsync(endpoint, stringContent);
    // }
    
    public async Task<HttpResponseMessage> Request(HttpMethod method, string endpoint, 
        object? requestBody, KeyValuePair<string, string>[]? cookies)
    {
        using var appClient = _appTestFactory.CreateClient();
        var jsonBody = JsonSerializer.Serialize(requestBody);
        var stringContent = new StringContent(jsonBody, Encoding.UTF8, "application/json");
        var request = new HttpRequestMessage(method, endpoint);
        request.Content = stringContent;
        if (cookies is not null)
        {
            var cookieStrigs = cookies.Select(c => c.Key + "=" + c.Value);
            request.Headers.Add("Cookie", String.Join("; ", cookieStrigs));
        }
        return await appClient.SendAsync(request);
    }

    public async Task<HttpResponseMessage> PostRequest(string endpoint, object requestBody)
    {
        return await Request(HttpMethod.Post, endpoint, requestBody, null);
    }
    
    public async Task<HttpResponseMessage> PostRequest(string endpoint, object? requestBody, 
        KeyValuePair<string, string> cookie)
    {
        var cookies = new [] { cookie };
        return await Request(HttpMethod.Post, endpoint, requestBody, cookies);
    }
}