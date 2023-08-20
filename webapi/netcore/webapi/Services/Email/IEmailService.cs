using webapi.Controllers.Auth.Dto;

namespace webapi.Services.Email;

public interface IEmailService
{
    public Task<string?> SendEmailVerificationMessage(string toAddress, string verificationUrl, Dictionary<string, string> cssVariables);
}