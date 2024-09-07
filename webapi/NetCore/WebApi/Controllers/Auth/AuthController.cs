using System.Net.Mime;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using WebApi.Controllers.Auth.Dto;
using WebApi.Helpers;
using WebApi.Helpers.Exceptions;
using WebApi.Models.Auth;
using WebApi.Services.Email;

namespace WebApi.Controllers.Auth;

[ApiController, Route("/webapi/auth/[action]")]
public class AuthController : Controller
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppSignInManager _signInManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IEmailService _emailService;
    private readonly ISecureDataFormat<RefreshToken> _refreshTokenProtector;

    // private async Task AddFakeUsers()
    // {
    //     using var reader = new StreamReader("/home/dmitry/Downloads/MOCK_DATA.csv");
    //     var line = await reader.ReadLineAsync();
    //     while (!reader.EndOfStream)
    //     {
    //         line = await reader.ReadLineAsync();
    //         if (line is null) { continue; }
    //         var values = line.Split(',');
    //         var user = new AppUser { UserName = values[1], Email = values[2], EmailConfirmed = true}; 
    //         var result = await _userManager.CreateAsync(user, values[3]);
    //         if (!result.Succeeded)
    //         {
    //             throw new ActionException(result);
    //         }
    //     }
    // }

    public AuthController(
        UserManager<AppUser> userManager,
        AppSignInManager signInManager,
        RoleManager<IdentityRole> roleManager,
        IEmailService emailService,
        ISecureDataFormat<RefreshToken> refreshTokenProtector
        )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _roleManager = roleManager;
        _emailService = emailService;
        _refreshTokenProtector = refreshTokenProtector;
    }
    
    private async Task<string> MakeVerificationUrl(AccountData requestBody, AppUser user)
    {
        var confirmationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var scheme = Request.GetHeader("OriginScheme") ?? Request.Scheme;
        var host = Request.GetHeader("OriginHost") ?? Request.Host.Host;
        var confirmationUrl = $"{scheme}://{host}";
        if (requestBody.ReturnPath != null)
        {
            confirmationUrl += requestBody.ReturnPath;
        }
        var parameter = new Dictionary<string, string?>{ 
            { "overlay", "email-verification" },
            { "email", user.Email },
            { "username", user.UserName },
            { "email-verification", confirmationToken }
        };
        return new Uri(QueryHelpers.AddQueryString(confirmationUrl, parameter)).ToString();
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> SignUp([FromBody] AccountDataDto body)
    {
        // create new user
        var account = body.Account ?? new AccountData();
        var user = new AppUser { UserName = account.Username, Email = account.Email }; 
        var result = await _userManager.CreateAsync(user, account.Password!);
        if (!result.Succeeded)
        {
            throw new ActionException(result);
        }
        
        // request email verification
        var verificationUrl = await MakeVerificationUrl(account, user);
        var styles = body.Styles ?? new Dictionary<string, string>();
        var messageId = await _emailService.SendEmailVerificationMessage(user.Email!, verificationUrl, styles);
        if (messageId == null) // if verification message was not sent
        {
            await _userManager.DeleteAsync(user); // delete newly created user
            throw new ActionException("EmailVerificationSendFail", "Failed to send email verification message");
        }
        
        return StatusCode(201);
    }

    [HttpPost]
    public async Task<IActionResult> VerifyEmail([FromBody] EmailConfirmationDto body)
    {
        // check request body
        var bodyErrors = new List<string>();
        if (body.Username == null)
        {
            bodyErrors.Add("EmptyUsername");
        }
        if (body.Token == null)
        {
            bodyErrors.Add("EmptyToken");
        }
        if (bodyErrors.Count > 0)
        {
            throw new ActionException(bodyErrors);
        }
        
        // find user by username
        var user = await _userManager.FindByNameAsync(body.Username!);
        if (user == null)
        {
            throw new ActionException("InvalidUsername");
        }
        if (user.EmailConfirmed)
        {
            throw new ActionException("AlreadyVerified");
        }
        
        // confirm email
        var result = await _userManager.ConfirmEmailAsync(user, body.Token!);
        if (!result.Succeeded)
        {
            throw new ActionException(result);
        }
        return Ok();
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> SignIn([FromBody] AccountData request)
    {
        const string loginErrorCode = "WrongCredentials";
        
        // Find user.
        var user = await _userManager.FindByNameAsync(request.Username!);
        if (user == null)
        {
            throw new ActionException(loginErrorCode);
        }
        
        // Check if user's email is verified.
        if (!user.EmailConfirmed)
        {
            throw new ActionException("EmailNotConfirmed");
        }
        
        // Sign the user in.
        var signInResult = await _signInManager.PasswordSignInAsync(
            user, request.Password!, isPersistent: true, lockoutOnFailure: false);
        if (!signInResult.Succeeded)
        {
            throw new ActionException(loginErrorCode);
        }
        
        // Update refresh token.
        await _userManager.UpdateRefreshToken(user, HttpContext, _refreshTokenProtector);
        
        // Add cookie with user's access permissions
        await _userManager.AddAccessCookie(user, HttpContext);
        
        return Ok(new { username = user.UserName });
    }
    
    [HttpPost]
    [Authorize]
    public new async Task<IActionResult> SignOut()
    {
        await _signInManager.SignOutAsync();
        return Ok();
    }
}
