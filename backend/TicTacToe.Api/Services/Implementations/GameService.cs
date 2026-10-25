using TicTacToe.Api.Data;
using TicTacToe.Api.Dtos.Requests;
using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Exceptions;
using TicTacToe.Api.Models;
using TicTacToe.Api.Options;
using TicTacToe.Api.Rules;
using Microsoft.Extensions.Options;

namespace TicTacToe.Api.Services.Implementations;

public sealed class GameService(
    IGameStore gameStore,
    IScoreboardService scoreboardService,
    IOptions<GameSessionOptions> sessionOptions) : IGameService
{
    private readonly TimeSpan sessionLifetime = TimeSpan.FromMinutes(sessionOptions.Value.ExpirationMinutes);

    public GameStateResponse CreateGame(Guid sessionId, GameMode mode) => Snapshot(gameStore.Create(sessionId, mode));

    public GameStateResponse GetGame(Guid gameId) =>
        ExecuteWithGame(gameId, Snapshot);

    public GameStateResponse MakeMove(Guid gameId, MoveRequest request) =>
        ExecuteWithGame(gameId, game =>
        {
            ValidatePlayerMove(game, request);
            ApplyMove(game, request.Player, request.CellIndex);

            if (game.GameMode == GameMode.Computer && game.Status == GameStatus.InProgress)
            {
                ApplyMove(game, Player.O, ComputerMoveSelector.SelectMove(game.Board));
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

    public GameStateResponse ResetGame(Guid gameId, GameMode? mode = null) =>
        ExecuteWithGame(gameId, game =>
        {
            game.Reset(mode ?? game.GameMode, DateTimeOffset.UtcNow.Add(sessionLifetime));
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

    private static void ValidatePlayerMove(GameSession game, MoveRequest request)
    {
        if (game.Status != GameStatus.InProgress)
        {
            throw new GameRuleException("Moves are unavailable after the game is complete.", 409);
        }

        if (request.CellIndex is < 0 or > 8)
        {
            throw new GameRuleException("The selected cell is outside the board.");
        }

        if (game.GameMode == GameMode.Computer && request.Player != Player.X)
        {
            throw new GameRuleException("Only Player X can submit moves in computer mode.", 409);
        }

        if (request.Player != game.CurrentPlayer)
        {
            throw new GameRuleException($"It is Player {game.CurrentPlayer}'s turn.", 409);
        }

        if (game.Board[request.CellIndex] is not null)
        {
            throw new GameRuleException("The selected cell is already occupied.", 409);
        }
    }

    private void ApplyMove(GameSession game, Player player, int cellIndex)
    {
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
            return;
        }

        if (GameRules.IsDraw(game.Board))
        {
            game.Status = GameStatus.Draw;
            RecordResult(game);
            return;
        }

        game.CurrentPlayer = player == Player.X ? Player.O : Player.X;
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
        scoreboardService.Get(),
        game.ExpiresAt);
}
