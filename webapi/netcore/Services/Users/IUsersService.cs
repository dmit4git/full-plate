using webapi.Models.Security;

namespace webapi.Services.Users;

public interface IUsersService
{
    IEnumerable<AppUser> GetAll();
}