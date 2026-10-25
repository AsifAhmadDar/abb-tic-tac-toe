using TicTacToe.Api.Models;
using TicTacToe.Api.Rules;

namespace TicTacToe.Tests;

public sealed class GameRulesTests
{
    [Fact]
    public void FindWinningLine_returns_the_matching_row()
    {
        Player?[] board = [Player.X, Player.X, Player.X, Player.O, null, Player.O, null, null, null];

        var line = GameRules.FindWinningLine(board, Player.X);

        Assert.Equal([0, 1, 2], line);
    }

    [Fact]
    public void FindWinningLine_returns_empty_when_player_has_no_line()
    {
        Player?[] board = [Player.X, Player.O, null, null, Player.X, null, Player.O, null, null];

        Assert.Empty(GameRules.FindWinningLine(board, Player.X));
    }

    [Fact]
    public void IsDraw_returns_true_only_when_all_cells_are_occupied()
    {
        Player?[] fullBoard = [Player.X, Player.O, Player.X, Player.O, Player.X, Player.O, Player.O, Player.X, Player.O];
        Player?[] openBoard = [Player.X, Player.O, null, Player.O, Player.X, Player.O, Player.O, Player.X, Player.O];

        Assert.True(GameRules.IsDraw(fullBoard));
        Assert.False(GameRules.IsDraw(openBoard));
    }
}
