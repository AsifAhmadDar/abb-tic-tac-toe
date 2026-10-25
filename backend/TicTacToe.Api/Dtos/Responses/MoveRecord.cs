using TicTacToe.Api.Models;

namespace TicTacToe.Api.Dtos.Responses;

public sealed record MoveRecord(
    int MoveNumber,
    Player Player,
    int CellIndex,
    int Row,
    int Column);
