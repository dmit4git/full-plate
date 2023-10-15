using System.Net.Mime;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Controllers.Admin.Dto;
using WebApi.Controllers.Auth;
using WebApi.Controllers.Auth.Dto;
using WebApi.Helpers.Exceptions;
using WebApi.Models.Auth;

namespace WebApi.Controllers.Admin;

[ApiController, Route("/webapi/admin/[action]")]
public class PermissionsController : Controller
{
    
    private readonly UserManager<AppUser> _userManager;

    public PermissionsController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }
    
    [HttpGet]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> Permissions([FromQuery] string? search, [FromQuery] int? take, [FromQuery] int? skip)
    {
        var permissions = new List<UserPermissions>();
        var appUsersList = _userManager.Users.Where(u => 
                search == null || (u.NormalizedUserName ?? "").Contains(search.ToUpper()) 
                               || (u.NormalizedEmail ?? "").Contains(search.ToUpper()))
            .OrderBy(u => u.UserName).Take(Math.Min(take ?? 10, 100)).Skip(skip ?? 0).ToList();
        foreach (var appUser in appUsersList)
        {
            var userPermissions = new UserPermissions(appUser);
            var claims = await _userManager.GetClaimsAsync(appUser);
            userPermissions.SetClaims(claims);
            permissions.Add(userPermissions);
        }

        return Ok(permissions);
    }
    
    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> Permissions([FromBody] MultiUserPermissions multiUserPermissions)
    {
        foreach (var userInfo in multiUserPermissions.users)
        {
            await ApplyUserPermissions(userInfo, multiUserPermissions.Claims);
        }

        return Ok();
    }

    private async Task ApplyUserPermissions(UserInfo userInfo, Dictionary<string, bool> claimsDictionary)
    {
        if (userInfo.Email is null)
        {
            throw new ActionException("InvalidEmail");
        }
        var user = await _userManager.FindByNameAsync(userInfo.Username!);
        if (user is null)
        {
            throw new ActionException("UserNotFound");
        }
        
        var userClaims = await _userManager.GetClaimsAsync(user);
        var groupedClaims = claimsDictionary.GroupBy(c => c.Value);
        foreach (var claimsGroup in groupedClaims)
        {
            if (claimsGroup.Key) // group with truthy claims
            {
                // remove existing claims with given keys
                KeyValuePair<string, bool> defaultKeyValuePair = default(KeyValuePair<string, bool>);
                var existingClaims = userClaims.Where(uc => 
                    !claimsGroup.FirstOrDefault(tc => tc.Key == uc.Type).Equals(defaultKeyValuePair));
                var result = await _userManager.RemoveClaimsAsync(user, existingClaims);
                if (!result.Succeeded)
                {
                    throw new ActionException(result);
                }
                // add claims
                var claims = claimsGroup.Select(claim => 
                    new Claim(claim.Key, claim.Value.ToString()));
                result = await _userManager.AddClaimsAsync(user, claims);
                if (!result.Succeeded)
                {
                    throw new ActionException(result);
                }
            }
            else // group with falsy claims
            {
                // remove claims
                var falsyClaims = claimsGroup.Select(c => c.Key).ToList();
                var claimsToRemove = userClaims.Where(uc => falsyClaims.Find(fc => fc == uc.Type) != null ).ToList();
                var result = await _userManager.RemoveClaimsAsync(user, claimsToRemove);
                if (!result.Succeeded)
                {
                    throw new ActionException(result);
                }
            }
            
        }
    }
}