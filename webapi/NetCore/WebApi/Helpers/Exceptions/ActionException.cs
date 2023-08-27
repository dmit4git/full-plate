using System.Net.Mime;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using Microsoft.AspNetCore.Identity;

namespace WebApi.Helpers.Exceptions;

public class ActionException : Exception, IEquatable<ActionException>
{
    /***** Properties *****/
    
    [JsonIgnore] public int Status { get; init; } = StatusCodes.Status500InternalServerError;

    [JsonIgnore] public string ContentType { get; init; } = MediaTypeNames.Application.Json;

    [JsonPropertyName("errors")] public List<ActionError>? Errors { get; init; }

    public ActionError? Error => Errors is not null && Errors.Count > 0 ? Errors[0] : null;

    /***** Constructors *****/
    
    static ActionException()
    {
        // JSON serialization options
        JsonSerializerOptions = new()
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            TypeInfoResolver = new DefaultJsonTypeInfoResolver
            {
                Modifiers = { TypeInfoModifier }
            }
        };
    }
    
    public ActionException() { }

    public ActionException(string errorCode)
    {
        var error = new ActionError(errorCode);
        Errors = new List<ActionError>{ error };
    }
    
    public ActionException(IList<string> errorCodes)
    {
        Errors = errorCodes.Select(ec => new ActionError(ec)).ToList();
    }
    
    public ActionException(string errorCode, string description)
    {
        var error = new ActionError(errorCode, description);
        Errors = new List<ActionError>{ error };
    }

    public ActionException(IdentityResult identityResult)
    {
        Errors = identityResult.Errors.Select(identityError => new ActionError(identityError)).ToList();
    }

    /***** Comparison methods *****/
    
    public bool Equals(ActionException? other)
    {
        if (ReferenceEquals(null, other)) return false;
        if (ReferenceEquals(this, other)) return true;
        if (Status != other.Status || ContentType != other.ContentType) return false;
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
        return HashCode.Combine(Status, ContentType, Errors);
    }

    /***** JSON serialization *****/
    
    public static readonly JsonSerializerOptions JsonSerializerOptions;
    
    private static void TypeInfoModifier(JsonTypeInfo typeInfo)
    {
        var fieldNamesSet = new HashSet<string>{ "errors", "code", "description"};
        foreach (var propertyInfo in typeInfo.Properties)
        {
            if (!fieldNamesSet.Contains(propertyInfo.Name))
            {
                propertyInfo.ShouldSerialize = (object obj, object? nullable) => false;
            }
        }
    }
    
    public string ToJsonString()
    {
        return JsonSerializer.Serialize(this, JsonSerializerOptions);
    }

    public static ActionException? FromJsonString(string jsonString)
    {
        return JsonSerializer.Deserialize<ActionException>(jsonString, JsonSerializerOptions);
    }

    public override string ToString()
    {
        return ToJsonString();
    }
}
