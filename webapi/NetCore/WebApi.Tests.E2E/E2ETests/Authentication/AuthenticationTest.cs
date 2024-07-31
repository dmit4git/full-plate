using Microsoft.Playwright;
using WebApi.Controllers.Auth.Dto;
using WebApi.E2ETests.Helpers;
using static WebApi.Helpers.Waiter;

namespace WebApi.E2ETests.E2ETests.Authentication;

[Parallelizable(ParallelScope.Self)]
[TestFixture, Order(1)]
public class AuthenticationTest : PlaywrightE2ETest
{
    private readonly AccountData _accountData = new ()
    {
        Username = "e2e_test_username", Password = "e2e_test_Password", Email = "e2e_test@email.com"
    };

    [SetUp]
    public async Task AuthenticationTestSetup()
    {
        // remove test user
        var user = await WebApiHelper.UserManager.FindByNameAsync(_accountData.Username!);
        if (user is not null)
        {
            await WebApiHelper.UserManager.DeleteAsync(user);
        }
    }
    
    [Test]
    public async Task RunAuthenticationTest()
    {
        await SignUpTest();
        await SignInTest();
        await SignOutTest();
    }
    
    async Task SignUpTest()
    {
        // Create new account
        await Page.GotoAsync("");
        await Page.Locator("[aria-label=\"User\"]").ClickAsync();
        await Page.GetByText("Account").ClickAsync();
        await Page.GetByText("Create New Account").ClickAsync();
        var emailInput = Page.GetByLabel("email");
        await emailInput.ClickAsync();
        await emailInput.FillAsync(_accountData.Email!);
        var usernameInput = Page.GetByLabel("username");
        await usernameInput.ClickAsync();
        await usernameInput.FillAsync(_accountData.Username!);
        var passwordInput = Page.Locator("input[name=\"password\"]");
        await passwordInput.ClickAsync();
        await passwordInput.FillAsync(_accountData.Password!);
        var passwordRepeatInput = Page.Locator("input[name=\"password repeat\"]");
        await passwordRepeatInput.ClickAsync();
        await passwordRepeatInput.FillAsync(_accountData.Password!);
        await GetButtonByName("Create Account").ClickAsync();
        await Wait(_accountData, UserFoundPredicate);
        // Check account values
        var user = await WebApiHelper.UserManager.FindByNameAsync(_accountData.Username!);
        Assert.That(user, Is.Not.Null);
        Assert.That(user.Email, Is.EqualTo(_accountData.Email));
        Assert.That(user.UserName, Is.EqualTo(_accountData.Username));
        
        // Verify email
        Assert.That(user.EmailConfirmed, Is.False);
        var confirmationToken = await WebApiHelper.UserManager.GenerateEmailConfirmationTokenAsync(user);
        await WebApiHelper.UserManager.ConfirmEmailAsync(user, confirmationToken);
        Assert.That(user.EmailConfirmed, Is.True);
    }

    async Task SignInTest()
    {
        await Page.GetByText("Sign In").ClickAsync();
        var usernameInput = Page.Locator("#sign-in-username");
        await usernameInput.ClickAsync();
        await usernameInput.FillAsync(_accountData.Username!);
        var passwordInput = Page.Locator("#sign-in-password").GetByRole(AriaRole.Textbox);
        await passwordInput.ClickAsync();
        await passwordInput.FillAsync(_accountData.Password!);
        await GetButtonByName("Sign In").ClickAsync();
        await Expect(Page.GetByText("Sign Out").First).ToBeVisibleAsync();
        await Expect(Page.GetByText(_accountData.Username!)).ToBeVisibleAsync();
    }

    async Task SignOutTest()
    {
        await Page.GetByText("Sign Out").ClickAsync();
        await GetButtonByName("Sign Out").ClickAsync();
        await Expect(Page.GetByText("Sign Out").First).Not.ToBeVisibleAsync();
        await Expect(Page.GetByText(_accountData.Username!)).Not.ToBeVisibleAsync();
    }
    
    private static async Task<bool> UserFoundPredicate(AccountData accountData)
    {
        var user = await WebApiHelper.UserManager.FindByNameAsync(accountData.Username!);
        return user is not null;
    }
}
