using Microsoft.Extensions.Configuration;
using WebApi.Helpers.Readers;
using WebApi.Services.Email;

namespace WebApi.Tests.Mocks;

public class FakeAwsSesService: AwsSesService
{
    public string? VerificationUrl { get; set; }
    
    public FakeAwsSesService(IConfiguration config, IEmbeddedResourceReader resourceReader) 
        : base(config, resourceReader) { }

    public override async Task<string?> SendEmailVerificationMessage(
        string toAddress, string verificationUrl, Dictionary<string, string> cssVariables)
    {
        return await Task.Run<string?>(() =>
        {
            VerificationUrl = verificationUrl;
            return "FakeMessageId";
        });
    }
}