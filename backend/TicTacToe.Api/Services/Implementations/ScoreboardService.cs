using TicTacToe.Api.Models;
using TicTacToe.Api.Dtos.Responses;

namespace TicTacToe.Api.Services.Implementations;

public sealed class ScoreboardService : IScoreboardService
{
    private readonly object _syncRoot = new();
    private ScoreboardState _scoreboard = new(0, 0, 0);

    public ScoreboardResponse Get()
    {
        lock (_syncRoot)
        {
            return ToResponse();
        }
    }

    public void Record(Player? winner)
    {
        lock (_syncRoot)
        {
            _scoreboard = winner switch
            {
                Player.X => _scoreboard with { XWins = _scoreboard.XWins + 1 },
                Player.O => _scoreboard with { OWins = _scoreboard.OWins + 1 },
                null => _scoreboard with { Draws = _scoreboard.Draws + 1 },
                _ => throw new ArgumentOutOfRangeException(nameof(winner), winner, "The winner is not a supported player.")
            };
        }
    }

    public ScoreboardResponse Reset()
    {
        lock (_syncRoot)
        {
            _scoreboard = new ScoreboardState(0, 0, 0);
            return ToResponse();
        }
    }

    private ScoreboardResponse ToResponse() =>
        new(_scoreboard.XWins, _scoreboard.OWins, _scoreboard.Draws);
}
