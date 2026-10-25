using TicTacToe.Api.Models;

namespace TicTacToe.Api.Data;

public interface IGameStore
{
    GameSession Create(Guid gameId, GameMode mode);
    GameSession Get(Guid gameId);
}
