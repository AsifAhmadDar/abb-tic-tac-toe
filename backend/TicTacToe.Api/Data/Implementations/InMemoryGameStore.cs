using System.Collections.Concurrent;
using TicTacToe.Api.Exceptions;
using TicTacToe.Api.Models;
using TicTacToe.Api.Options;
using Microsoft.Extensions.Options;

namespace TicTacToe.Api.Data.Implementations;

public sealed class InMemoryGameStore : IGameStore
{
    private readonly ConcurrentDictionary<Guid, GameSession> _games = new();
    private readonly TimeSpan _sessionLifetime;

    public InMemoryGameStore(IOptions<GameSessionOptions> options)
    {
        _sessionLifetime = TimeSpan.FromMinutes(options.Value.ExpirationMinutes);
    }

    public GameSession Create(Guid gameId, GameMode mode)
    {
        var game = new GameSession(gameId, mode, DateTimeOffset.UtcNow.Add(_sessionLifetime));
        if (!_games.TryAdd(game.GameId, game))
        {
            throw new GameRuleException("That SESSION-ID is already in use.", 409);
        }

        return game;
    }

    public GameSession Get(Guid gameId)
    {
        if (!_games.TryGetValue(gameId, out var game))
        {
            throw new GameNotFoundException(gameId);
        }

        if (game.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            _games.TryRemove(new KeyValuePair<Guid, GameSession>(gameId, game));
            throw new GameSessionExpiredException(gameId);
        }

        return game;
    }

    public int RemoveExpiredSessions(DateTimeOffset now)
    {
        var removed = 0;
        foreach (var pair in _games)
        {
            if (pair.Value.ExpiresAt <= now &&
                _games.TryRemove(new KeyValuePair<Guid, GameSession>(pair.Key, pair.Value)))
            {
                removed++;
            }
        }

        return removed;
    }
}
