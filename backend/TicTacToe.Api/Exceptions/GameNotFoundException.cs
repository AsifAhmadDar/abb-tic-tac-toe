namespace TicTacToe.Api.Exceptions;

public sealed class GameNotFoundException(Guid gameId)
    : Exception($"Game '{gameId}' was not found.");
