using Microsoft.AspNetCore.Mvc;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> Get() => Ok(new { status = "ok" });
}
