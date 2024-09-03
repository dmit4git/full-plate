using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Models;

namespace WebApi.Controllers.Auth.Checks;

[ApiController, Route("webapi/checks/[action]")]
public class AuthChecksController
{
    [HttpGet]
    public HelloWorldResponse UnprotectedEndpoint()
    {
        return new HelloWorldResponse{Value = "response"};
    }
    
    [HttpGet]
    [Authorize]
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