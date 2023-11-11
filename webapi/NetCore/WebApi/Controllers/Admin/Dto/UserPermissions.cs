using System.Security.Claims;
using WebApi.Models.Auth;

namespace WebApi.Controllers.Admin.Dto;

public class UserPermissions
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public Dictionary<string, bool> Claims { get; set; } = new ();

    public UserPermissions()
    { }
    
    public UserPermissions(AppUser user)
    {
        Username = user.UserName;
        Email = user.Email;
    }

    public void SetClaims(IList<Claim> claims)
    {
        foreach (Claim claim in claims)
        {
            if (Boolean.TryParse(claim.Value , out Boolean claimValue))
            {
                Claims[claim.Type] = claimValue;
            }
        }
    }
    
}