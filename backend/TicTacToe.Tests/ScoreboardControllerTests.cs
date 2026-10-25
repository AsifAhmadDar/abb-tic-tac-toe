using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Controllers;
using TicTacToe.Api.Data;
using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Models;
using TicTacToe.Api.Services;

namespace TicTacToe.Tests;

public sealed class ScoreboardControllerTests
{
    [Fact]
    public void Get_returns_the_session_scoreboard()
    {
        var scoreboard = new RecordingScoreboardService();
        var controller = CreateController(scoreboard);

        var result = controller.Get().Result as OkObjectResult;

        Assert.Equal(new ScoreboardResponse(2, 1, 3), result?.Value);
        Assert.Equal(1, scoreboard.GetCalls);
    }

    [Fact]
    public void Reset_clears_the_session_scoreboard()
    {
        var scoreboard = new RecordingScoreboardService();
        var controller = CreateController(scoreboard);

        controller.Reset();

        Assert.Equal(1, scoreboard.ResetCalls);
    }

    private static ScoreboardController CreateController(RecordingScoreboardService scoreboard)
    {
        var store = new RecordingGameStore();
        var context = new DefaultHttpContext();
        context.Request.Headers["SESSION-ID"] = store.Game.GameId.ToString();
        return new ScoreboardController(scoreboard, store)
        {
            ControllerContext = new ControllerContext { HttpContext = context }
        };
    }

    private sealed class RecordingScoreboardService : IScoreboardService
    {
        public int GetCalls { get; private set; }
        public int ResetCalls { get; private set; }

        public ScoreboardResponse Get()
        {
            GetCalls++;
            return new ScoreboardResponse(2, 1, 3);
        }

        public void Record(Player? winner) { }

        public ScoreboardResponse Reset()
        {
            ResetCalls++;
            return new ScoreboardResponse(0, 0, 0);
        }
    }

    private sealed class RecordingGameStore : IGameStore
    {
        public GameSession Game { get; } = new(Guid.NewGuid(), GameMode.TwoPlayer, DateTimeOffset.UtcNow.AddMinutes(30));

        public GameSession Create(Guid gameId, GameMode mode) => Game;
        public GameSession Get(Guid gameId) => Game;
        public int RemoveExpiredSessions(DateTimeOffset now) => 0;
    }
}
