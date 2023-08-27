using System.Text.RegularExpressions;
using Amazon;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using WebApi.Helpers.Readers;

namespace WebApi.Services.Email;

public class AwsSesService : IEmailService
{
    // private readonly IConfiguration _config;
    private readonly string _awsAccessKey;
    private readonly string _awsSecretKey;
    private readonly string? _contents;
    private readonly string? _encodedSvg;
    private const string Website = "fullplate.dev";

    public AwsSesService(IConfiguration config, IEmbeddedResourceReader resourceReader)
    {
        // _config = config;
        _awsAccessKey = config.GetValue<string>("AWS:AwsAccessKey")!;
        _awsSecretKey = config.GetValue<string>("AWS:AwsSecretKey")!;
        _contents = resourceReader.GetString("Services.Email.EmailVerificationMessage.html");
        var svg = resourceReader.GetString("WebApi.Services.Email.at.svg");
        // _contents = File.ReadAllText("resources/email/EmailVerificationMessage.html");
        // var svg = File.ReadAllText("WebApi.Services.Email.at.svg");
        _encodedSvg = EncodeSvg(svg);
    }
    
    // Encodes svg to be used inline inside html
    // https://github.com/yoksel/url-encoder/blob/3b60e5573edcaf933a1fb59a259c7e52719a584e/src/js/script.js#L133
    private string? EncodeSvg(string? svg)
    {
        if (svg == null)
        {
            return null;
        }
        svg = svg.Replace('"', '\'');
        svg = Regex.Replace(svg, @">\s{1,}<", "><");
        svg = Regex.Replace(svg, @"\s{2,}", " ");
        svg = Regex.Replace(svg, @"[\r\n%#()<>?\[\\\]^`{|}]", match => Uri.EscapeDataString(match.Value));
        return svg;
    }

    private string? MakeSvgUri(Dictionary<string, string> cssVariables)
    {
        if (cssVariables.TryGetValue("--primary-color", out var primaryColor))
        {
            var rgb = primaryColor.Replace("rgb(", "").Replace(")", "").Split(',');
            if (rgb.Length == 3)
            {
                var hexColor = "";
                foreach (var colorString in rgb)
                {
                    if (int.TryParse(colorString, out var intColor))
                    {
                        hexColor += intColor.ToString("X2");
                    }
                    else
                    {
                        return _encodedSvg;
                    }
                }
                if (_encodedSvg is not null)
                {
                    return _encodedSvg.Replace("abcdef", hexColor);
                }
            }
        }
        return _encodedSvg;
    }
    
    private string? MakeVerificationHtmlBody(string email, string verificationUrl, Dictionary<string, string> cssVariables)
    {
        if (cssVariables.TryGetValue("--primary-color", out var opaqueButton))
        {
            opaqueButton = opaqueButton.Replace("rgb(", "rgba(").Replace(")", ", 0.87)");
            cssVariables["--primary-color-087"] = opaqueButton;
        }
        var cssVariablesEnumerable = cssVariables.Keys.Select(key => key + ": " + cssVariables[key] + ';');
        var cssVariablesString = string.Join(Environment.NewLine, cssVariablesEnumerable);
        
        if (_contents is not null)
        {
            return _contents
                .Replace("/*styles*/", cssVariablesString) // add styles
                // .Replace("<!--svg-->", MakeSvgUri(cssVariables)) // set svg
                // set values
                .Replace("<!--email-->", email)
                .Replace("<!--website-->", Website)
                .Replace("<a href=\"\" class=\"p-button p-component\">Verify Email</a>",
                    $"<a href=\"{verificationUrl}\" class=\"p-button p-component\">Verify Email</a>");
        }

        return _contents;
    }

    public async Task<string?> SendEmailVerificationMessage(
        string toAddress, string verificationUrl, Dictionary<string, string> cssVariables)
    {
        var toAddresses = new List<string> {toAddress};
        const string fromAddress = "noreply@" + Website;
        const string subject = "email verification for " + Website;
        var htmlBody = MakeVerificationHtmlBody(toAddress, verificationUrl, cssVariables);
        var result = await SendEmail(fromAddress, toAddresses, 
            null, null, subject, null, htmlBody);
        return result?.MessageId;
    }

    /// <summary>
    ///  Send an email by using Amazon SES.
    /// </summary>
    /// <param name="toAddresses">List of recipients.</param>
    /// <param name="ccAddresses">List of cc recipients.</param>
    /// <param name="bccAddresses">List of bcc recipients.</param>
    /// <param name="bodyHtml">Body of the email in HTML.</param>
    /// <param name="bodyText">Body of the email in plain text.</param>
    /// <param name="subject">Subject line of the email.</param>
    /// <param name="senderAddress">From address.</param>
    /// <returns>The messageId of the email.</returns>
    public async Task<SendEmailResponse?> SendEmail(string senderAddress, List<string> toAddresses,
        List<string>? ccAddresses, List<string>? bccAddresses,
        string? subject, string? bodyText, string? bodyHtml)
    {
        SendEmailResponse? response = null;
        try
        {
            var destination = new Destination { ToAddresses = toAddresses };
            if (ccAddresses is not null && ccAddresses.Count > 0)
            {
                destination.CcAddresses = ccAddresses;
            }
            if (bccAddresses is not null && bccAddresses.Count > 0)
            {
                destination.BccAddresses = bccAddresses;
            }
            var sendEmailRequest = new SendEmailRequest
            {
                Destination = destination,
                Message = new Message
                {
                    Body = new Body
                    {
                        Html = new Content
                        {
                            Charset = "UTF-8",
                            Data = bodyHtml ?? string.Empty
                        },
                        Text = new Content
                        {
                            Charset = "UTF-8",
                            Data = bodyText ?? string.Empty
                        }
                    },
                    Subject = new Content
                    {
                        Charset = "UTF-8",
                        Data = subject ?? string.Empty
                    }
                },
                Source = senderAddress
            };
            using var client = new AmazonSimpleEmailServiceClient(
                _awsAccessKey, _awsSecretKey, RegionEndpoint.USEast1);
            {
                response = await client.SendEmailAsync(sendEmailRequest);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("SendEmailAsync failed with exception: " + ex.Message);
        }
    
        return response;
    }
}
