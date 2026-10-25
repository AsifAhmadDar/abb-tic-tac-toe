namespace TicTacToe.Api.Exceptions;

public sealed class GameRuleException(string message, int statusCode = 400) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
