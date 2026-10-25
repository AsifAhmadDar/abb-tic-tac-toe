using Microsoft.Extensions.Options;
using TicTacToe.Api.Data.Implementations;
using TicTacToe.Api.Exceptions;
using TicTacToe.Api.Models;
using TicTacToe.Api.Options;

namespace TicTacToe.Tests;

public sealed class InMemoryGameStoreTests
{
    [Fact]
    public void Create_then_get_returns_the_same_game_session()
    {
        var store = CreateStore();
        var gameId = Guid.NewGuid();

        var created = store.Create(gameId, GameMode.Computer);

        Assert.Same(created, store.Get(gameId));
        Assert.Equal(GameMode.Computer, created.GameMode);
    }

    [Fact]
    public void Create_rejects_a_duplicate_session_id()
    {
        var store = CreateStore();
        var gameId = Guid.NewGuid();
        store.Create(gameId, GameMode.TwoPlayer);

        var exception = Assert.Throws<GameRuleException>(() => store.Create(gameId, GameMode.Computer));

        Assert.Equal(409, exception.StatusCode);
    }

    [Fact]
    public void Get_removes_and_rejects_an_expired_session()
    {
        var store = new InMemoryGameStore(Options.Create(new GameSessionOptions { ExpirationMinutes = 1 }));
        var gameId = Guid.NewGuid();
        store.Create(gameId, GameMode.TwoPlayer);

        var removed = store.RemoveExpiredSessions(DateTimeOffset.UtcNow.AddMinutes(2));

        Assert.Equal(1, removed);
        Assert.Throws<GameNotFoundException>(() => store.Get(gameId));
    }

    [Fact]
    public void Get_rejects_a_session_that_expires_before_validation()
    {
        var store = new InMemoryGameStore(Options.Create(new GameSessionOptions { ExpirationMinutes = -1 }));
        var gameId = Guid.NewGuid();
        store.Create(gameId, GameMode.TwoPlayer);

        Assert.Throws<GameSessionExpiredException>(() => store.Get(gameId));
    }

    [Fact]
    public void Cleanup_keeps_active_sessions()
    {
        var store = CreateStore();
        var gameId = Guid.NewGuid();
        store.Create(gameId, GameMode.TwoPlayer);

        Assert.Equal(0, store.RemoveExpiredSessions(DateTimeOffset.UtcNow));
        Assert.NotNull(store.Get(gameId));
    }

    private static InMemoryGameStore CreateStore() =>
        new(Options.Create(new GameSessionOptions { ExpirationMinutes = 30 }));
}
