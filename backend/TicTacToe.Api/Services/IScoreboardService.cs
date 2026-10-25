using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public interface IScoreboardService
{
    ScoreboardResponse Get();
    void Record(Player? winner);
    ScoreboardResponse Reset();
}
