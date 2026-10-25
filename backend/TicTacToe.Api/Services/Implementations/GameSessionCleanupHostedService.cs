using Microsoft.Extensions.Options;
using TicTacToe.Api.Data;
using TicTacToe.Api.Options;

namespace TicTacToe.Api.Services.Implementations;

public sealed class GameSessionCleanupHostedService(
    IGameStore gameStore,
    IOptions<GameSessionOptions> options,
    ILogger<GameSessionCleanupHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var interval = TimeSpan.FromSeconds(options.Value.CleanupIntervalSeconds);
        using var timer = new PeriodicTimer(interval);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            var removed = gameStore.RemoveExpiredSessions(DateTimeOffset.UtcNow);
            if (removed > 0)
            {
                logger.LogDebug("Removed {ExpiredSessionCount} expired game sessions.", removed);
            }
        }
    }
}
