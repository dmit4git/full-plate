using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace WebApi.Helpers.Exceptions;

public class ActionError: IEquatable<ActionError>, IEqualityComparer<ActionError>
{
    /***** Properties *****/
    
    [JsonPropertyName("code")] public string? Code { get; init; }

    [JsonPropertyName("description")] public string? Description { get; init; }
 
    /***** Constructors *****/
    
    public ActionError() { }
    
    public ActionError(string code)
    {
        Code = code;
    }
    
    public ActionError(string code, string? description): this(code)
    {
        Description = description;
    }

    public ActionError(IdentityError identityError)
    {
        Code = identityError.Code;
        Description = identityError.Description;
    }

    /***** Comparison methods *****/
    
    public bool Equals(ActionError? other)
    {
        if (ReferenceEquals(null, other)) return false;
        if (ReferenceEquals(this, other)) return true;
        return Code == other.Code && Description == other.Description;
    }

    public override bool Equals(object? obj)
    {
        if (ReferenceEquals(null, obj)) return false;
        if (ReferenceEquals(this, obj)) return true;
        if (GetType() != obj.GetType()) return false;
        return Equals((ActionError)obj);
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Code, Description);
    }

    /***** JSON serialization *****/
    
    public bool Equals(ActionError? x, ActionError? y)
    {
        if (ReferenceEquals(x, y)) return true;
        if (ReferenceEquals(x, null)) return false;
        if (ReferenceEquals(y, null)) return false;
        if (x.GetType() != y.GetType()) return false;
        return x.Code == y.Code && x.Description == y.Description;
    }

    public int GetHashCode(ActionError obj)
    {
        return HashCode.Combine(obj.Code, obj.Description);
    }
    
    public string ToJsonString()
    {
        return JsonSerializer.Serialize(this, ActionException.JsonSerializerOptions);
    }
    
    public static ActionError? FromJsonString(string jsonString)
    {
        return JsonSerializer.Deserialize<ActionError>(jsonString, ActionException.JsonSerializerOptions);
    }
    
    public override string ToString()
    {
        return ToJsonString();
    }
}
