using TicTacToe.Api.Data;
using TicTacToe.Api.Dtos.Requests;
using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Exceptions;
using TicTacToe.Api.Models;
using TicTacToe.Api.Rules;

namespace TicTacToe.Api.Services.Implementations;

public sealed class GameService(IGameStore gameStore, IScoreboardService scoreboardService) : IGameService
{
    public GameStateResponse CreateGame(Guid sessionId, GameMode mode) => Snapshot(gameStore.Create(sessionId, mode));

    public GameStateResponse GetGame(Guid gameId) =>
        ExecuteWithGame(gameId, Snapshot);

    public GameStateResponse MakeMove(Guid gameId, MoveRequest request) =>
        ExecuteWithGame(gameId, game =>
        {
            if (!TryApplyPlayerMove(game, request))
            {
                return Snapshot(game);
            }

            if (game.GameMode == GameMode.Computer && game.Status == GameStatus.InProgress)
            {
                TryApplyMove(game, Player.O, ComputerMoveSelector.SelectMove(game.Board));
            }

            return Snapshot(game);
        });

    public GameStateResponse Undo(Guid gameId) =>
        ExecuteWithGame(gameId, game =>
        {
            if (game.Status != GameStatus.InProgress)
            {
                throw new GameRuleException("Undo is unavailable after a game is complete.", 409);
            }

            if (game.Moves.Count == 0)
            {
                throw new GameRuleException("There are no moves to undo.");
            }

            var removeCount = game.GameMode == GameMode.Computer ? 2 : 1;
            var remainingMoves = game.Moves
                .Take(Math.Max(0, game.Moves.Count - removeCount))
                .ToList();

            game.Restore(remainingMoves);
            return Snapshot(game);
        });

    public GameStateResponse ResetGame(Guid gameId) =>
        ExecuteWithGame(gameId, game =>
        {
            game.Reset();
            return Snapshot(game);
        });

    private GameStateResponse ExecuteWithGame(
        Guid gameId,
        Func<GameSession, GameStateResponse> operation)
    {
        var game = gameStore.Get(gameId);
        lock (game.SyncRoot)
        {
            return operation(game);
        }
    }

    private bool TryApplyPlayerMove(GameSession game, MoveRequest request)
    {
        if (game.Status != GameStatus.InProgress)
        {
            return false;
        }

        if (request.CellIndex is < 0 or > 8)
        {
            return false;
        }

        if (game.GameMode == GameMode.Computer && request.Player != Player.X)
        {
            return false;
        }

        return TryApplyMove(game, request.Player, request.CellIndex);
    }

    private bool TryApplyMove(GameSession game, Player player, int cellIndex)
    {
        if (player != game.CurrentPlayer)
        {
            return false;
        }

        if (game.Board[cellIndex] is not null)
        {
            return false;
        }

        game.Board[cellIndex] = player;
        game.Moves.Add(new GameMove(player, cellIndex));

        var winningLine = GameRules.FindWinningLine(game.Board, player);
        if (winningLine.Length > 0)
        {
            game.Status = GameStatus.Won;
            game.Winner = player;
            game.WinningCells.Clear();
            game.WinningCells.AddRange(winningLine);
            RecordResult(game);
            return true;
        }

        if (GameRules.IsDraw(game.Board))
        {
            game.Status = GameStatus.Draw;
            RecordResult(game);
            return true;
        }

        game.CurrentPlayer = player == Player.X ? Player.O : Player.X;
        return true;
    }

    private void RecordResult(GameSession game)
    {
        if (game.ResultRecorded)
        {
            return;
        }

        scoreboardService.Record(game.Winner);
        game.ResultRecorded = true;
    }

    private GameStateResponse Snapshot(GameSession game) => new(
        game.GameId,
        game.Board.ToArray(),
        game.CurrentPlayer,
        game.GameMode,
        game.Status,
        game.Winner,
        game.WinningCells.ToArray(),
        game.Moves
            .Select((move, index) => new MoveRecord(
                index + 1,
                move.Player,
                move.CellIndex,
                move.CellIndex / 3 + 1,
                move.CellIndex % 3 + 1))
            .ToArray(),
        scoreboardService.Get());
}
