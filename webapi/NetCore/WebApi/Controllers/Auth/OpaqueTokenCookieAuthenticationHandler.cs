using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using WebApi.Models.Auth;
using WebApi.Models.Data;
using static Microsoft.AspNetCore.Http.StatusCodes;
using static WebApi.Helpers.Constants.AppConstants;

namespace WebApi.Controllers.Auth;

public class OpaqueTokenCookieAuthenticationHandler : CookieAuthenticationHandler
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppSignInManager _signInManager;
    private readonly ISecureDataFormat<RefreshToken> _refreshTokenProtector;
    private readonly EntityContext _databaseContext;
    
    public OpaqueTokenCookieAuthenticationHandler(
        // base class arguments
        IOptionsMonitor<CookieAuthenticationOptions> options, ILoggerFactory logger, 
        UrlEncoder encoder, ISystemClock clock,
        // services
        UserManager<AppUser> userManager, AppSignInManager signInManager, 
        ISecureDataFormat<RefreshToken> refreshTokenProtector, EntityContext databaseContext
        ) : base(options, logger, encoder, clock)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _refreshTokenProtector = refreshTokenProtector;
        _databaseContext = databaseContext;
    }
    
    protected override async Task HandleForbiddenAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = Status403Forbidden;
    }

    protected override async Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = Status401Unauthorized;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var baseResult = await base.HandleAuthenticateAsync();
        if (baseResult.None || (baseResult.Failure is not null && baseResult.Failure.Message == "Ticket expired"))
        { // If cookie is not found (expected for expired cookie) or it has expired.
            return await CheckRefreshToken();
        }

        return baseResult;
    }

    private async Task<AuthenticateResult> CheckRefreshToken()
    {
        // Read refresh token from cookie.
        var refreshTokenCookie = Options.CookieManager.GetRequestCookie(Context, RefreshTokenCookieName);
        if (refreshTokenCookie is null)
        {
            return AuthenticateResult.NoResult();
        }

        var refreshToken = _refreshTokenProtector.Unprotect(refreshTokenCookie);
        if (refreshToken is null || refreshToken.ExpiresAt < Clock.UtcNow)
        {
            // If token decryption from cookie failed or the token has expired.
            return AuthenticateResult.NoResult();
        }

        // Find user with that token in the database. 
        var user = await _userManager.Users.SingleOrDefaultAsync(user =>
            user.RefreshToken != null && user.RefreshToken.Id == refreshToken.Id);
        if (user is null || !user.RefreshToken!.Valid)
        { // If there is no user with given token or the token has been revoked (set invalid).
            return AuthenticateResult.NoResult();
        }

        // Update refresh token.
        await _userManager.UpdateRefreshToken(user, Context, _refreshTokenProtector);
        var claimsPrincipal = await _signInManager.CreateUserPrincipalAsync(user);

        // Update access token.
        AuthenticationProperties authenticationProperties = new AuthenticationProperties();
        authenticationProperties.IsPersistent = true;
        await HandleSignInAsync(claimsPrincipal, authenticationProperties);

        // Return Result.
        var ticket = new AuthenticationTicket(claimsPrincipal, OpaqueTokenCookieScheme);
        return AuthenticateResult.Success(ticket);
    }

    protected override async Task HandleSignOutAsync(AuthenticationProperties? properties)
    {
        await base.HandleSignOutAsync(properties);
        
        // Remove refresh token from database
        var name = Context.User.Identity?.Name;
        if (name is not null)
        {
            var user = await _userManager.Users.SingleOrDefaultAsync(user => 
                user.UserName == name);
            if (user?.RefreshToken is not null)
            {
                _databaseContext.RefreshTokens.Remove(user.RefreshToken);
                await _databaseContext.SaveChangesAsync();
            }
        }

        // Remove refresh token cookie
        CookieOptions cookieOptions = BuildCookieOptions();
        Options.CookieManager.DeleteCookie(Context, RefreshTokenCookieName, cookieOptions);
    }
    
    private CookieOptions BuildCookieOptions()
    {
        CookieOptions cookieOptions = Options.Cookie.Build(Context);
        cookieOptions.Expires = new DateTimeOffset?();
        return cookieOptions;
    }
}