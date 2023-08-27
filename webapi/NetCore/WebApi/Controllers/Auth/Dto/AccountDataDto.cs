namespace WebApi.Controllers.Auth.Dto;

public class AccountData
{
    public string? Email { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? ReturnPath { get; set; }
}

public class AccountDataDto
{
    public AccountData? Account { get; set; }
    public Dictionary<string, string>? Styles { get; set; }
}
