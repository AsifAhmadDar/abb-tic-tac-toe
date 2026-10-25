using TicTacToe.Api.Models;

namespace TicTacToe.Api.Dtos.Requests;

public sealed record MoveRequest(Player Player, int CellIndex);
