using TicTacToe.Api.Models;

namespace TicTacToe.Api.Dtos.Requests;

public sealed record CreateGameRequest(GameMode? Mode);
