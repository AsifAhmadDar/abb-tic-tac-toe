using TicTacToe.Api.Models;
using TicTacToe.Api.Rules;

namespace TicTacToe.Tests;

public sealed class ComputerMoveSelectorTests
{
    [Fact]
    public void SelectMove_takes_a_winning_move_before_other_priorities()
    {
        Player?[] board = [Player.O, Player.O, null, Player.X, null, Player.X, null, null, null];

        Assert.Equal(2, ComputerMoveSelector.SelectMove(board));
    }

    [Fact]
    public void SelectMove_blocks_a_human_winning_move_when_it_cannot_win()
    {
        Player?[] board = [Player.X, Player.X, null, Player.O, null, null, null, null, null];

        Assert.Equal(2, ComputerMoveSelector.SelectMove(board));
    }

    [Fact]
    public void SelectMove_prefers_the_center_then_a_corner()
    {
        Player?[] openBoard = new Player?[9];
        Player?[] centerTaken = [null, Player.X, null, Player.O, Player.X, null, null, Player.O, null];

        Assert.Equal(4, ComputerMoveSelector.SelectMove(openBoard));
        Assert.Equal(0, ComputerMoveSelector.SelectMove(centerTaken));
    }

    [Fact]
    public void SelectMove_uses_the_first_remaining_cell_when_no_corner_is_open()
    {
        Player?[] board = [Player.X, Player.O, Player.X, Player.O, Player.X, Player.O, Player.O, Player.X, null];

        Assert.Equal(8, ComputerMoveSelector.SelectMove(board));
    }
}
