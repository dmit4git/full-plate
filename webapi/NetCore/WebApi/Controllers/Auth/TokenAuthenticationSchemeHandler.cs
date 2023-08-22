using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;

namespace WebApi.Controllers.Access;

public class TokenAuthenticationSchemeHandler : AuthenticationHandler<JwtBearerOptions>
{
    public TokenAuthenticationSchemeHandler(
        IOptionsMonitor<JwtBearerOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock) : base(options, logger, encoder, clock)
    { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // Read the token from request headers/cookies
        // Check that it's a valid session, depending on your implementation
        
        // If the session is valid, return success:
        var principal = new ClaimsPrincipal(new ClaimsIdentity("Test"));
        var ticket = new AuthenticationTicket(principal, this.Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));

        // If the token is missing or the session is invalid, return failure:
        // return AuthenticateResult.Fail("Authentication failed");
    }
}
