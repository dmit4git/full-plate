namespace WebApi.Controllers.Admin.Dto;

public class MultiUserPermissions
{
    public IList<string> users { get; set; } = new List<string>();
    public Dictionary<string, bool> Claims { get; set; } = new ();

    public MultiUserPermissions()
    { }
}