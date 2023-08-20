using Newtonsoft.Json;

namespace webapi.Helpers.Exceptions;

public class ActionError
{
    [JsonProperty("code", NullValueHandling=NullValueHandling.Ignore)]
    public string? Code { get; set; }
    
    [JsonProperty("description", NullValueHandling=NullValueHandling.Ignore)]
    
    public string? Description { get; set; }
    
    public ActionError(string code)
    {
        Code = code;
    }
    
    public ActionError(string code, string description): this(code)
    {
        Description = description;
    }
}