using Microsoft.AspNetCore.Mvc;

namespace webapi.Controllers;

public class ErrorController : ControllerBase
{
    [Route("/error")]
    public IActionResult Error()
    {
        return Problem();
    }
}