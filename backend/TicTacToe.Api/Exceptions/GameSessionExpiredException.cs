namespace TicTacToe.Api.Exceptions;

public sealed class GameSessionExpiredException(Guid sessionId)
    : Exception($"Game session '{sessionId}' has expired. Start a new game.");
