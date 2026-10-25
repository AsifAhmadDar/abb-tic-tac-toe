using TicTacToe.Api.Models;

namespace TicTacToe.Api.Dtos.Requests;

public sealed record ResetGameRequest(GameMode? Mode);
