using Microsoft.AspNetCore.Identity;

namespace WebApi.Models.Auth;

public class AppUser : IdentityUser
{
    public RefreshToken? RefreshToken { get; set; }
}
