using Microsoft.Extensions.Primitives;

namespace webapi.Helpers;

public static class HeadersHelper
{
    public static string? GetHeader(this HttpRequest request, string headerName)
    {
        var headerValues = request.Headers[headerName];
        return headerValues != StringValues.Empty ? headerValues[0]! : null;
    }
}