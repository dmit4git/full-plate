using System.Net.Mime;
using Duende.IdentityServer.Extensions;
using Serilog;
using WebApi.Helpers.Exceptions;

namespace WebApi.Middlewares;

public class ActionExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ActionExceptionMiddleware(RequestDelegate next)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ActionException exception)
        {
            if (context.Response.HasStarted)
            {
                await Task.CompletedTask;
            }

            context.Response.Clear();
            context.Response.StatusCode = exception.Status;

            switch (exception.ContentType)
            {
                case MediaTypeNames.Application.Json:
                    await context.Response.WriteJsonAsync(exception.ToJsonString());
                    break;
                case MediaTypeNames.Text.Plain:
                    await context.Response.WriteJsonAsync(exception.Error != null ? exception.Error.Code : "");
                    break;
            }
        }
        catch (Exception exception)
        {
            Log.Error(exception, "Message of uncaught exception: {Message}", exception.Message);
            context.Response.Clear();
            context.Response.StatusCode = 500;
        }
    }
}
