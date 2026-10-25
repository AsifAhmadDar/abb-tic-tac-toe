using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Dtos.Requests;
using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Models;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/games")]
public sealed class GamesController(IGameService gameService) : ControllerBase
{
    [HttpPost]
    public ActionResult<GameStateResponse> CreateGame([FromBody] CreateGameRequest? request)
    {
        var sessionId = SessionIdHeader.GetRequired(Request.Headers);
        return Ok(gameService.CreateGame(sessionId, request?.Mode ?? GameMode.TwoPlayer));
    }

    [HttpGet]
    public ActionResult<GameStateResponse> GetCurrentGame() =>
        Ok(gameService.GetGame(GetCurrentGameId()));

    [HttpPost("moves")]
    public ActionResult<GameStateResponse> MakeMove([FromBody] MoveRequest request) =>
        Ok(gameService.MakeMove(GetCurrentGameId(), request));

    [HttpPost("undo")]
    public ActionResult<GameStateResponse> Undo() =>
        Ok(gameService.Undo(GetCurrentGameId()));

    [HttpPost("reset")]
    public ActionResult<GameStateResponse> Reset([FromBody] ResetGameRequest? request) =>
        Ok(gameService.ResetGame(GetCurrentGameId(), request?.Mode));

    private Guid GetCurrentGameId()
        => SessionIdHeader.GetRequired(Request.Headers);
}
