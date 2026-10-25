namespace TicTacToe.Api.Options;

public sealed class GameSessionOptions
{
    public const string SectionName = "GameSession";

    public int ExpirationMinutes { get; init; } = 30;
    public int CleanupIntervalSeconds { get; init; } = 60;
}
