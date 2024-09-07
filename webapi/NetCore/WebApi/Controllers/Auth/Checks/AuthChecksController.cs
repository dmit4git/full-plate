using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Models;

namespace WebApi.Controllers.Auth.Checks;

[ApiController]
[Authorize]
[Route("webapi/checks/[action]")]
public class AuthChecksController
{
    [HttpGet]
    [AllowAnonymous]
    public HelloWorldResponse UnprotectedEndpoint()
    {
        return new HelloWorldResponse{Value = "response"};
    }
    
    [HttpGet]
    public HelloWorldResponse AuthenticationProtectedEndpoint()
    {
        return new HelloWorldResponse{Value = "response"};
    }
    
    [HttpGet]
    [Authorize(Roles = "hello-world-role")]
    public HelloWorldResponse RoleProtectedEndpoint()
    {
        return new HelloWorldResponse{Value = "response"};
    }
}