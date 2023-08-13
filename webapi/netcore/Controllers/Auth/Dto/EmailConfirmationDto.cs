namespace webapi.Controllers.Auth.Dto;

public class EmailConfirmationDto
{
    public string? Username { get; set; }
    public string? Token { get; set; }
}