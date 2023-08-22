using System.Net.Mime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using WebApi.Controllers.Auth.Dto;
using WebApi.Helpers;
using WebApi.Helpers.Exceptions;
using WebApi.Models.Security;
using WebApi.Services.Email;

namespace WebApi.Controllers.Auth;

[ApiController, Route("/webapi/auth/[action]")]
public class AuthController : Controller
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly IEmailService _emailService;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        IEmailService emailService
        )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _emailService = emailService;
    }
    
    private async Task<string> MakeVerificationUrl(SignUpAccount requestBody, AppUser user)
    {
        var verificationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var scheme = Request.GetHeader("OriginScheme") ?? Request.Scheme;
        var host = Request.GetHeader("OriginHost") ?? Request.Host.Host;
        var verificationUrl = $"{scheme}://{host}";
        if (requestBody.ReturnPath != null)
        {
            verificationUrl += requestBody.ReturnPath;
        }
        var parameter = new Dictionary<string, string?>() { 
            { "overlay", "email-verification" },
            { "email", user.Email },
            { "username", user.UserName },
            { "email-verification", verificationToken }
        };
        return new Uri(QueryHelpers.AddQueryString(verificationUrl, parameter)).ToString();
    }

    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> SignUp([FromBody] SignUpData body)
    {
        // create new user
        var account = body.Account ?? new SignUpAccount();
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

        // // add claims
        // var defaultClaims = new Claim[] { new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()) };
        // await _userManager.AddClaimsAsync(user, defaultClaims);
        
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
    public async Task<IActionResult> SignIn([FromBody] SignUpAccount request)
    {
        const string loginErrorCode = "WrongCredentials";
        
        // find user
        var user = await _userManager.FindByNameAsync(request.Username!);
        if (user == null)
        {
            throw new ActionException(loginErrorCode);
        }
        
        // check if user's email is verified
        if (!user.EmailConfirmed)
        {
            throw new ActionException("EmailNotConfirmed");
        }
        
        // sign the user in
        var signInResult = await _signInManager.PasswordSignInAsync(
            user, request.Password!, isPersistent: true, lockoutOnFailure: false);
        if (!signInResult.Succeeded)
        {
            throw new ActionException(loginErrorCode);
        }
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
