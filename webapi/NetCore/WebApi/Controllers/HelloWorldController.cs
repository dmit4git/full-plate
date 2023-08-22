using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Models;

namespace WebApi.Controllers;

[ApiController, Route("webapi/[action]")]
public class HelloWorldController : ControllerBase
{
    
    [HttpGet]
    [Authorize]
    public IActionResult HelloWorld() // HelloWorldRequest request
    {
        var response = new HelloWorldResponse{Value = $"response"};
        return Ok(response);
    }
}
