using TicTacToe.Api.Models;

namespace TicTacToe.Tests;

public sealed class GameSessionTests
{
    [Fact]
    public void Reset_clears_board_state_sets_mode_and_renews_expiry()
    {
        var originalExpiry = DateTimeOffset.UtcNow.AddMinutes(1);
        var renewedExpiry = DateTimeOffset.UtcNow.AddMinutes(30);
        var session = new GameSession(Guid.NewGuid(), GameMode.TwoPlayer, originalExpiry);
        session.Board[0] = Player.X;
        session.CurrentPlayer = Player.O;
        session.Status = GameStatus.Won;
        session.Winner = Player.X;
        session.WinningCells.Add(0);

        session.Reset(GameMode.Computer, renewedExpiry);

        Assert.Equal(GameMode.Computer, session.GameMode);
        Assert.Equal(renewedExpiry, session.ExpiresAt);
        Assert.All(session.Board, Assert.Null);
        Assert.Equal(Player.X, session.CurrentPlayer);
        Assert.Equal(GameStatus.InProgress, session.Status);
        Assert.Null(session.Winner);
        Assert.Empty(session.WinningCells);
    }
}
