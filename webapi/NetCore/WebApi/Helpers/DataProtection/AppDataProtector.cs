using Microsoft.AspNetCore.DataProtection;

namespace WebApi.Helpers.DataProtection;

public class AppDataProtector : IDataProtector
{
    private readonly IDataProtectionProvider _protectionProvider;
    
    public AppDataProtector(IDataProtectionProvider protectionProvider)
    {
        _protectionProvider = protectionProvider;
    }
    
    public IDataProtector CreateProtector(string purpose)
    {
        return _protectionProvider.CreateProtector(purpose);
    }

    public byte[] Protect(byte[] plaintext)
    {
        var protector = _protectionProvider.CreateProtector("AppDataProtectorPurpose");
        return protector.Protect(plaintext);
    }

    public byte[] Unprotect(byte[] protectedData)
    {
        var protector = _protectionProvider.CreateProtector("AppDataProtectorPurpose");
        return protector.Unprotect(protectedData);
    }
}