using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

public class ErrorController : ControllerBase
{
    [Route("/error")]
    public IActionResult Error()
    {
        return Problem();
    }
}
