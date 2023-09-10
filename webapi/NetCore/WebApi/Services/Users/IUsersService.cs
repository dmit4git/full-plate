using WebApi.Models.Auth;

namespace WebApi.Services.Users;

public interface IUsersService
{
    IEnumerable<AppUser> GetAll();
}
