using WebApi.Models.Security;

namespace WebApi.Services.Users;

public interface IUsersService
{
    IEnumerable<AppUser> GetAll();
}
