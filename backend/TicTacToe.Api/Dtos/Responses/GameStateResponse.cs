using TicTacToe.Api.Models;

namespace TicTacToe.Api.Dtos.Responses;

public sealed record GameStateResponse(
    Guid GameId,
    IReadOnlyList<Player?> Board,
    Player CurrentPlayer,
    GameMode GameMode,
    GameStatus Status,
    Player? Winner,
    IReadOnlyList<int> WinningCells,
    IReadOnlyList<MoveRecord> Moves,
    ScoreboardResponse Scoreboard);
