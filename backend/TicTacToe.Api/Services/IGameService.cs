using TicTacToe.Api.Dtos.Requests;
using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public interface IGameService
{
    GameStateResponse CreateGame(Guid sessionId, GameMode mode);
    GameStateResponse GetGame(Guid gameId);
    GameStateResponse MakeMove(Guid gameId, MoveRequest request);
    GameStateResponse Undo(Guid gameId);
    GameStateResponse ResetGame(Guid gameId, GameMode? mode = null);
}
