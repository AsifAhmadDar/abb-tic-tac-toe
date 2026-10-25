using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Data;
using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/scoreboard")]
public sealed class ScoreboardController(IScoreboardService scoreboardService, IGameStore gameStore) : ControllerBase
{
    [HttpGet]
    public ActionResult<ScoreboardResponse> Get()
    {
        ValidateSession(gameStore);
        return Ok(scoreboardService.Get());
    }

    [HttpPost("reset")]
    public ActionResult<ScoreboardResponse> Reset()
    {
        ValidateSession(gameStore);
        return Ok(scoreboardService.Reset());
    }

    private void ValidateSession(IGameStore store)
        => store.Get(SessionIdHeader.GetRequired(Request.Headers));
}
