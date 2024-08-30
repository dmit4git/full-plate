using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Models;

namespace WebApi.Controllers;

[ApiController, Route("webapi/[action]")]
public class HelloWorldController : ControllerBase
{
    
    [HttpGet]
    [Authorize(Roles = "hello-world-role")]
    public IActionResult HelloWorld() // /hello-world request
    {
        var response = new HelloWorldResponse{Value = "response"};
        return Ok(response);
    }
}
