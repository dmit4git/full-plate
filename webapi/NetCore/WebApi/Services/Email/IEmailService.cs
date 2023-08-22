using WebApi.Controllers.Auth.Dto;

namespace WebApi.Services.Email;

public interface IEmailService
{
    public Task<string?> SendEmailVerificationMessage(string toAddress, string verificationUrl, Dictionary<string, string> cssVariables);
}
