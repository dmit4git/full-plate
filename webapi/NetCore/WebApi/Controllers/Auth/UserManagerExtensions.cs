using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using WebApi.Models.Auth;
using static WebApi.Helpers.Constants.AppConstants;

namespace WebApi.Controllers.Auth;

public static class UserManagerExtensions
{
    public static async Task<IdentityResult> UpdateRefreshToken(this UserManager<AppUser> userManager, 
        AppUser user, HttpContext context, ISecureDataFormat<RefreshToken> refreshTokenProtector)
    {
        user.RefreshToken ??= new RefreshToken();
        user.RefreshToken.Update();
        var result = await userManager.UpdateAsync(user);
        if (result.Succeeded)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = user.RefreshToken.ExpiresAt
            };
            var protectedToken = refreshTokenProtector.Protect(user.RefreshToken);
            context.Response.Cookies.Append(RefreshTokenCookieName, protectedToken, cookieOptions);
        }
        return result;
    }
}