using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Controllers;

namespace TicTacToe.Tests;

public sealed class HealthControllerTests
{
    [Fact]
    public void Get_returns_an_ok_health_status()
    {
        var result = new HealthController().Get().Result as OkObjectResult;

        Assert.NotNull(result);
        Assert.Equal("ok", result!.Value?.GetType().GetProperty("status")?.GetValue(result.Value));
    }
}
