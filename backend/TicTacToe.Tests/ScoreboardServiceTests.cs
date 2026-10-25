using TicTacToe.Api.Models;
using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Services.Implementations;

namespace TicTacToe.Tests;

public sealed class ScoreboardServiceTests
{
    [Fact]
    public void Record_updates_the_winner_totals_and_draw_total()
    {
        var service = new ScoreboardService();

        service.Record(Player.X);
        service.Record(Player.O);
        service.Record(null);

        Assert.Equal(new ScoreboardResponse(1, 1, 1), service.Get());
    }

    [Fact]
    public void Reset_clears_all_scoreboard_totals()
    {
        var service = new ScoreboardService();
        service.Record(Player.X);
        service.Record(Player.X);

        var result = service.Reset();

        Assert.Equal(new ScoreboardResponse(0, 0, 0), result);
        Assert.Equal(result, service.Get());
    }

    [Fact]
    public void Record_rejects_an_unsupported_player_value()
    {
        var service = new ScoreboardService();

        Assert.Throws<ArgumentOutOfRangeException>(() => service.Record((Player)999));
    }
}
