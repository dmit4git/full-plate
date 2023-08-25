using System.Net.Mime;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;

namespace WebApi.Helpers.Exceptions;

[JsonObject(MemberSerialization.OptIn)]
public class ActionException : Exception, IEquatable<ActionException>
{
    public int Status { get; }
    
    public string ContentType { get; }
    
    [JsonProperty("error", NullValueHandling=NullValueHandling.Ignore)]
    public ActionError? Error { get; set; }
    
    [JsonProperty("errors", NullValueHandling=NullValueHandling.Ignore)]
    public List<ActionError>? Errors { get; }

    public ActionException(): this(StatusCodes.Status500InternalServerError, MediaTypeNames.Application.Json) { }
    
    public ActionException(int status): this(status, MediaTypeNames.Application.Json) { }
    
    public ActionException(int status, string mediaType)
    {
        Status = status;
        ContentType = MediaTypeNames.Application.Json;
    }
    
    public ActionException(string errorCode): this()
    {
        Error = new ActionError(errorCode);
    }
    public ActionException(List<string> errorCodes): this()
    {
        Errors = errorCodes.Select(ec => new ActionError(ec)).ToList();
    }
    
    public ActionException(string errorCode, string description): this()
    {
        Error = new ActionError(errorCode, description);
    }

    public ActionException(IdentityResult result): this()
    {
        Errors = result.Errors.Select(e => new ActionError(e.Code, e.Description)).ToList();
    }

    public bool Equals(ActionException? other)
    {
        if (ReferenceEquals(null, other)) return false;
        if (ReferenceEquals(this, other)) return true;
        if (Status != other.Status || ContentType != other.ContentType || !Equals(Error, other.Error)) return false;
        // Errors lists comparison 
        if (Errors == null) return other.Errors == null;
        if (other.Errors == null) return false;
        return Errors.SequenceEqual(other.Errors);
    }

    public override bool Equals(object? obj)
    {
        if (ReferenceEquals(null, obj)) return false;
        if (ReferenceEquals(this, obj)) return true;
        if (GetType() != obj.GetType()) return false;
        return Equals((ActionException)obj);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Status, ContentType, Error, Errors);
    }
}
