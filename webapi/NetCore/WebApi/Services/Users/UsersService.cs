using WebApi.Models.Auth;
using WebApi.Models.Data;

namespace WebApi.Services.Users;

public class UsersService : IUsersService
{
    private EntityContext _dataContext;

    public UsersService(EntityContext dataContext)
    {
        _dataContext = dataContext;
    }
    
    public IEnumerable<AppUser> GetAll()
    {
        throw new NotImplementedException();
    }
}
