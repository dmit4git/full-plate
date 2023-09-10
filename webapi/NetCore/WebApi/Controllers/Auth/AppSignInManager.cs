using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using WebApi.Models.Auth;
using static WebApi.Helpers.Constants.AppConstants;

namespace WebApi.Controllers.Auth;

public class AppSignInManager : SignInManager<AppUser>
{
    public AppSignInManager(UserManager<AppUser> userManager, IHttpContextAccessor contextAccessor, IUserClaimsPrincipalFactory<AppUser> claimsFactory, IOptions<IdentityOptions> optionsAccessor, ILogger<AppSignInManager> logger, IAuthenticationSchemeProvider schemes, IUserConfirmation<AppUser> confirmation) : base(userManager, contextAccessor, claimsFactory, optionsAccessor, logger, schemes, confirmation)
    {
    }
    
    public override async Task SignInWithClaimsAsync(
        AppUser user,
        AuthenticationProperties? authenticationProperties,
        IEnumerable<Claim> additionalClaims)
    {
        ClaimsPrincipal userPrincipalAsync = await CreateUserPrincipalAsync(user);
        foreach (Claim additionalClaim in additionalClaims)
            userPrincipalAsync.Identities.First().AddClaim(additionalClaim);
        await Context.SignInAsync(OpaqueTokenCookieScheme, userPrincipalAsync, authenticationProperties ?? new AuthenticationProperties());
    }
    
    public override async Task SignOutAsync()
    {
        await Context.SignOutAsync(OpaqueTokenCookieScheme);
        // await Context.SignOutAsync(IdentityConstants.ExternalScheme);
        // await Context.SignOutAsync(IdentityConstants.TwoFactorUserIdScheme);
    }
}