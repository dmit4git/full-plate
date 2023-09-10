using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;

namespace WebApi.Models.Auth;

[Table("RefreshTokens")]
public class RefreshToken
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    public bool Valid { get; set; } = true;

    [NotMapped] [JsonIgnore]
    private static readonly ISystemClock SystemClock = new SystemClock();
    
    [NotMapped] [JsonIgnore]
    private static readonly TimeSpan LifeSpan = TimeSpan.FromDays(7);

    public void Update()
    {
        CreatedAt = SystemClock.UtcNow;
        ExpiresAt = CreatedAt.Add(LifeSpan);
    }
}

public class RefreshTokenProtector : SecureDataFormat<RefreshToken>
{
    private const string ProtectorPurpose = "RefreshTokenProtectorPurpose";

    public RefreshTokenProtector(IDataSerializer<RefreshToken> serializer, IDataProtector protector) 
        : base(serializer, protector)
    {
    }

    public new string Protect(RefreshToken data) => Protect(data, ProtectorPurpose);

    public new RefreshToken? Unprotect(string? protectedText) => Unprotect(protectedText, ProtectorPurpose);
}