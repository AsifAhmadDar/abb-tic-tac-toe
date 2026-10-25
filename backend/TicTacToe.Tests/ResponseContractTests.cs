using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Models;

namespace TicTacToe.Tests;

public sealed class ResponseContractTests
{
    [Fact]
    public void MoveRecord_preserves_move_position_contract()
    {
        var record = new MoveRecord(2, Player.O, 5, 2, 3);

        Assert.Equal(2, record.MoveNumber);
        Assert.Equal(Player.O, record.Player);
        Assert.Equal(5, record.CellIndex);
        Assert.Equal(2, record.Row);
        Assert.Equal(3, record.Column);
    }
}
