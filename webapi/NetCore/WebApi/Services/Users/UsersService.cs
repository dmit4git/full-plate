using WebApi.Models.Security;

namespace WebApi.Services.Users;

public class UsersService : IUsersService
{
    private EF_DataContext _dataContext;

    public UsersService(EF_DataContext dataContext)
    {
        _dataContext = dataContext;
    }
    
    public IEnumerable<AppUser> GetAll()
    {
        throw new NotImplementedException();
    }
}
