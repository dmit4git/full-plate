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
    public async Task<IActionResult> Permissions([FromQuery] string? search, [FromQuery] int? first, [FromQuery] int? last)
    {
        var permissions = new List<UserPermissions>();
        var query = _userManager.Users;
        if (search is not null && search != String.Empty)
        {
            query = query.Where(u => 
                (u.NormalizedUserName ?? "").Contains(search.ToUpper()) 
                || (u.NormalizedEmail ?? "").Contains(search.ToUpper()));
        }
        var count = query.Count();
        var lastInt = Math.Min(last ?? 10, 1000);
        var skip = first ?? 0;
        var appUsersList = query.OrderBy(u => u.UserName).Skip(first ?? 0).Take(lastInt - skip).ToList();
        foreach (var appUser in appUsersList)
        {
            var userPermissions = new UserPermissions(appUser);
            var claims = await _userManager.GetClaimsAsync(appUser);
            userPermissions.SetClaims(claims);
            permissions.Add(userPermissions);
        }
        
        return Ok(new {permissions, count });
    }
    
    [HttpPost]
    [Produces(MediaTypeNames.Application.Json)]
    public async Task<IActionResult> Permissions([FromBody] MultiUserPermissions multiUserPermissions)
    {
        foreach (var username in multiUserPermissions.users)
        {
            await ApplyUserPermissions(username, multiUserPermissions.Claims);
        }

        return Ok();
    }

    private async Task ApplyUserPermissions(string username, Dictionary<string, bool> claimsDictionary)
    {
        var user = await _userManager.FindByNameAsync(username);
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