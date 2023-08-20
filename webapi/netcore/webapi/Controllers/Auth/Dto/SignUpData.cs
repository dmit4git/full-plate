namespace webapi.Controllers.Auth.Dto;

public class SignUpAccount
{
    public string? Email { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? ReturnPath { get; set; }
}

public class SignUpData
{
    public SignUpAccount? Account { get; set; }
    public Dictionary<string, string>? Styles { get; set; }
}