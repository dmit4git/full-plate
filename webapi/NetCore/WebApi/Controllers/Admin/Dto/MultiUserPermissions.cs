namespace WebApi.Controllers.Admin.Dto;

public class UserInfo
{
    public string? Username { get; set; }
    public string? Email { get; set; }

    public UserInfo()
    { }
}

public class MultiUserPermissions
{
    public IList<UserInfo> users { get; set; } = new List<UserInfo>();
    public Dictionary<string, bool> Claims { get; set; } = new ();

    public MultiUserPermissions()
    { }
}