using Newtonsoft.Json;

namespace WebApi.Helpers.Exceptions;

public class ActionError: IEquatable<ActionError>, IEqualityComparer<ActionError>
{
    public ActionError() { }
    
    [JsonProperty("code", NullValueHandling=NullValueHandling.Ignore)]
    public string? Code { get; }
    
    [JsonProperty("description", NullValueHandling=NullValueHandling.Ignore)]
    
    public string? Description { get; }
    
    [JsonConstructor]
    public ActionError(string code)
    {
        Code = code;
    }
    
    public ActionError(string code, string description): this(code)
    {
        Description = description;
    }

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
}
