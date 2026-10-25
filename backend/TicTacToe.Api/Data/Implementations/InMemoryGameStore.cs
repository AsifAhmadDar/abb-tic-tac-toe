using System.Collections.Concurrent;
using TicTacToe.Api.Exceptions;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Data.Implementations;

public sealed class InMemoryGameStore : IGameStore
{
    private readonly ConcurrentDictionary<Guid, GameSession> _games = new();

    public GameSession Create(Guid gameId, GameMode mode)
    {
        var game = new GameSession(gameId, mode);
        if (!_games.TryAdd(game.GameId, game))
        {
            throw new GameRuleException("That SESSION-ID is already in use.", 409);
        }

        return game;
    }

    public GameSession Get(Guid gameId) =>
        _games.TryGetValue(gameId, out var game)
            ? game
            : throw new GameNotFoundException(gameId);
}
