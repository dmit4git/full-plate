using System.Net.Mime;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace WebApi.Helpers.Exceptions;

[JsonObject(MemberSerialization.OptIn)]
public class ActionException : Exception
{
    public ActionException(): base() { }
    public int Status { get; set; } = 500;
    
    public string ContentType { get; set; } = MediaTypeNames.Application.Json;
    
    [JsonProperty("error", NullValueHandling=NullValueHandling.Ignore)]
    public ActionError? Error { get; set; } = null;
    
    [JsonProperty("errors", NullValueHandling=NullValueHandling.Ignore)]
    public List<ActionError>? Errors { get; set; } = null;
    
    public ActionException(int status)
    {
        Status = status;
    }
    
    public ActionException(string errorCode)
    {
        Error = new ActionError(errorCode);
    }
    public ActionException(List<string> errorCodes)
    {
        Errors = errorCodes.Select(ec => new ActionError(ec)).ToList();
    }
    
    public ActionException(string errorCode, string description)
    {
        Error = new ActionError(errorCode, description);
    }

    public ActionException(IdentityResult result)
    {
        Errors = result.Errors.Select(e => new ActionError(e.Code, e.Description)).ToList();
    }
}
