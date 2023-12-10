using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using WebApi.Helpers.DataStructures;
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
    
    public static async Task AddAccessCookie(this UserManager<AppUser> userManager, 
        AppUser? user, HttpContext context)
    {
        // Get user claims
        var userClaims = await userManager.GetClaimsAsync(user);
        
        // Make tree of access permissions
        var accessTree = new Dictionary<string, object>();
        foreach (var claim in userClaims)
        {
            if (!Boolean.TryParse(claim.Value, out bool boolValue) || !boolValue)
            { // if claim value is falsy
                continue;
            }
            // make tree of access permissions
            var node = accessTree;
            var nodeNames = claim.Type.Split(ChildKeyAccessor);
            var nodeNamesCount = nodeNames.Length;
            for (int i = 0; i < nodeNamesCount - 1; i++)
            {
                var nodeName = nodeNames[i];
                node = (Dictionary<string, object>)node.GetOrSetDefault(nodeName, new Dictionary<string, object>());
            }
            
        }
        // add cookie with user's access tree
        var json = JsonSerializer.Serialize(accessTree);
        context.Response.Cookies.Append(AccessTreeCookieName, json);
    }
}