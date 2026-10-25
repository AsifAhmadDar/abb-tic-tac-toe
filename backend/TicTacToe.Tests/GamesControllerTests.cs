using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Controllers;
using TicTacToe.Api.Dtos.Requests;
using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Exceptions;
using TicTacToe.Api.Models;
using TicTacToe.Api.Services;

namespace TicTacToe.Tests;

public sealed class GamesControllerTests
{
    [Fact]
    public void CreateGame_uses_the_requested_mode_and_session_header()
    {
        var service = new RecordingGameService();
        var controller = CreateController(service);

        controller.CreateGame(new CreateGameRequest(GameMode.Computer));

        Assert.Equal(service.SessionId, service.LastGameId);
        Assert.Equal(GameMode.Computer, service.LastMode);
    }

    [Fact]
    public void CreateGame_defaults_to_two_player_when_body_is_missing()
    {
        var service = new RecordingGameService();
        var controller = CreateController(service);

        controller.CreateGame(null);

        Assert.Equal(GameMode.TwoPlayer, service.LastMode);
    }

    [Fact]
    public void Game_actions_forward_the_session_and_request_to_the_application_service()
    {
        var service = new RecordingGameService();
        var controller = CreateController(service);
        var request = new MoveRequest(Player.X, 4);

        controller.GetCurrentGame();
        controller.MakeMove(request);
        controller.Undo();
        controller.Reset(new ResetGameRequest(GameMode.Computer));

        Assert.Equal(service.SessionId, service.LastGameId);
        Assert.Equal(request, service.LastMove);
        Assert.Equal(GameMode.Computer, service.LastMode);
        Assert.Equal(1, service.GetCalls);
        Assert.Equal(1, service.UndoCalls);
    }

    [Fact]
    public void Requests_without_a_valid_session_header_are_rejected()
    {
        var controller = new GamesController(new RecordingGameService())
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        Assert.Throws<GameRuleException>(() => controller.GetCurrentGame());
    }

    private static GamesController CreateController(RecordingGameService service)
    {
        var sessionId = Guid.NewGuid();
        service.SessionId = sessionId;
        var context = new DefaultHttpContext();
        context.Request.Headers["SESSION-ID"] = sessionId.ToString();
        return new GamesController(service)
        {
            ControllerContext = new ControllerContext { HttpContext = context }
        };
    }

    private sealed class RecordingGameService : IGameService
    {
        public Guid SessionId { get; set; }
        public Guid LastGameId { get; private set; }
        public GameMode LastMode { get; private set; }
        public MoveRequest? LastMove { get; private set; }
        public int GetCalls { get; private set; }
        public int UndoCalls { get; private set; }

        public GameStateResponse CreateGame(Guid sessionId, GameMode mode)
        {
            LastGameId = sessionId;
            LastMode = mode;
            return EmptyResponse();
        }

        public GameStateResponse GetGame(Guid gameId)
        {
            LastGameId = gameId;
            GetCalls++;
            return EmptyResponse();
        }

        public GameStateResponse MakeMove(Guid gameId, MoveRequest request)
        {
            LastGameId = gameId;
            LastMove = request;
            return EmptyResponse();
        }

        public GameStateResponse Undo(Guid gameId)
        {
            LastGameId = gameId;
            UndoCalls++;
            return EmptyResponse();
        }

        public GameStateResponse ResetGame(Guid gameId, GameMode? mode = null)
        {
            LastGameId = gameId;
            LastMode = mode ?? GameMode.TwoPlayer;
            return EmptyResponse();
        }

        private static GameStateResponse EmptyResponse() => new(
            Guid.NewGuid(),
            new Player?[9],
            Player.X,
            GameMode.TwoPlayer,
            GameStatus.InProgress,
            null,
            [],
            [],
            new ScoreboardResponse(0, 0, 0),
            DateTimeOffset.UtcNow.AddMinutes(30));
    }
}
