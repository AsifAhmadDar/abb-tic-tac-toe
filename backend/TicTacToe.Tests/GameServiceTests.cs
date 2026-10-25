using TicTacToe.Api.Models;
using TicTacToe.Api.Dtos.Requests;
using TicTacToe.Api.Dtos.Responses;
using TicTacToe.Api.Data;
using TicTacToe.Api.Data.Implementations;
using TicTacToe.Api.Exceptions;
using TicTacToe.Api.Services;
using TicTacToe.Api.Services.Implementations;

namespace TicTacToe.Tests;

public sealed class GameServiceTests
{
    [Fact]
    public void ValidMove_switches_turn_and_records_position()
    {
        var service = CreateService();
        var game = CreateGame(service, GameMode.TwoPlayer);

        var updated = service.MakeMove(game.GameId, new MoveRequest(Player.X, 0));

        Assert.Equal(Player.X, updated.Board[0]);
        Assert.Equal(Player.O, updated.CurrentPlayer);
        Assert.Equal((1, 1), (updated.Moves[0].Row, updated.Moves[0].Column));
    }

    [Fact]
    public void Invalid_move_does_not_change_state()
    {
        var service = CreateService();
        var game = CreateGame(service, GameMode.TwoPlayer);
        service.MakeMove(game.GameId, new MoveRequest(Player.X, 0));

        var noOp = service.MakeMove(game.GameId, new MoveRequest(Player.O, 0));

        var current = service.GetGame(game.GameId);
        Assert.Equal(current.Board, noOp.Board);
        Assert.Equal(Player.O, current.CurrentPlayer);
        Assert.Single(current.Moves);
    }

    [Fact]
    public void Row_win_highlights_cells_and_updates_scoreboard()
    {
        var service = CreateService();
        var game = CreateGame(service, GameMode.TwoPlayer);
        Play(service, game.GameId, Player.X, 0, Player.O, 3);
        Play(service, game.GameId, Player.X, 1, Player.O, 4);

        var result = service.MakeMove(game.GameId, new MoveRequest(Player.X, 2));

        Assert.Equal(GameStatus.Won, result.Status);
        Assert.Equal(Player.X, result.Winner);
        Assert.Equal([0, 1, 2], result.WinningCells);
        Assert.Equal(1, result.Scoreboard.XWins);
    }

    [Fact]
    public void Column_and_diagonal_wins_are_detected()
    {
        var service = CreateService();
        var columnGame = CreateGame(service, GameMode.TwoPlayer);
        Play(service, columnGame.GameId, Player.X, 0, Player.O, 1);
        Play(service, columnGame.GameId, Player.X, 3, Player.O, 2);
        var columnResult = service.MakeMove(columnGame.GameId, new MoveRequest(Player.X, 6));

        var diagonalGame = CreateGame(service, GameMode.TwoPlayer);
        Play(service, diagonalGame.GameId, Player.X, 0, Player.O, 1);
        Play(service, diagonalGame.GameId, Player.X, 4, Player.O, 2);
        var diagonalResult = service.MakeMove(diagonalGame.GameId, new MoveRequest(Player.X, 8));

        Assert.Equal([0, 3, 6], columnResult.WinningCells);
        Assert.Equal([0, 4, 8], diagonalResult.WinningCells);
    }

    [Fact]
    public void Full_board_without_winner_is_a_draw()
    {
        var service = CreateService();
        var game = CreateGame(service, GameMode.TwoPlayer);
        var moves = new[]
        {
            (Player.X, 0), (Player.O, 1), (Player.X, 2),
            (Player.O, 4), (Player.X, 3), (Player.O, 6),
            (Player.X, 5), (Player.O, 8), (Player.X, 7)
        };

        GameStateResponse? result = null;
        foreach (var move in moves)
        {
            result = service.MakeMove(game.GameId, new MoveRequest(move.Item1, move.Item2));
        }

        Assert.NotNull(result);
        Assert.Equal(GameStatus.Draw, result!.Status);
        Assert.Equal(1, result.Scoreboard.Draws);
    }

    [Fact]
    public void Reset_game_clears_board_and_keeps_scoreboard()
    {
        var service = CreateService();
        var game = CreateGame(service, GameMode.TwoPlayer);
        service.MakeMove(game.GameId, new MoveRequest(Player.X, 0));

        var reset = service.ResetGame(game.GameId);

        Assert.All(reset.Board, Assert.Null);
        Assert.Empty(reset.Moves);
        Assert.Equal(Player.X, reset.CurrentPlayer);
        Assert.Equal(new ScoreboardResponse(0, 0, 0), reset.Scoreboard);
    }

    [Fact]
    public void Undo_two_player_removes_one_move_and_restores_turn()
    {
        var service = CreateService();
        var game = CreateGame(service, GameMode.TwoPlayer);
        service.MakeMove(game.GameId, new MoveRequest(Player.X, 0));
        service.MakeMove(game.GameId, new MoveRequest(Player.O, 4));

        var undone = service.Undo(game.GameId);

        Assert.Null(undone.Board[4]);
        Assert.Equal(Player.O, undone.CurrentPlayer);
        Assert.Single(undone.Moves);
    }

    [Fact]
    public void Undo_computer_mode_removes_human_and_computer_moves()
    {
        var service = CreateService();
        var game = CreateGame(service, GameMode.Computer);
        service.MakeMove(game.GameId, new MoveRequest(Player.X, 0));

        var undone = service.Undo(game.GameId);

        Assert.All(undone.Board, Assert.Null);
        Assert.Empty(undone.Moves);
        Assert.Equal(Player.X, undone.CurrentPlayer);
    }

    [Fact]
    public void Computer_mode_takes_center_then_blocks_a_row()
    {
        var service = CreateService();
        var game = CreateGame(service, GameMode.Computer);

        var afterOpening = service.MakeMove(game.GameId, new MoveRequest(Player.X, 0));
        var afterThreat = service.MakeMove(game.GameId, new MoveRequest(Player.X, 1));

        Assert.Equal(Player.O, afterOpening.Board[4]);
        Assert.Equal(Player.O, afterThreat.Board[2]);
    }

    [Fact]
    public void Completed_game_rejects_more_moves_and_does_not_double_count()
    {
        var service = CreateService();
        var game = CreateGame(service, GameMode.TwoPlayer);
        Play(service, game.GameId, Player.X, 0, Player.O, 3);
        Play(service, game.GameId, Player.X, 1, Player.O, 4);
        var won = service.MakeMove(game.GameId, new MoveRequest(Player.X, 2));

        var noOp = service.MakeMove(game.GameId, new MoveRequest(Player.O, 5));
        Assert.Equal(won.Board, noOp.Board);
        Assert.Equal(won.Moves, noOp.Moves);
        Assert.Equal(1, service.GetGame(game.GameId).Scoreboard.XWins);
        Assert.Throws<GameRuleException>(() => service.Undo(game.GameId));
        Assert.Equal(1, won.Scoreboard.XWins);
    }

    private static IGameService CreateService() => new GameService(new InMemoryGameStore(), new ScoreboardService());

    private static GameStateResponse CreateGame(IGameService service, GameMode mode) =>
        service.CreateGame(Guid.NewGuid(), mode);

    private static void Play(IGameService service, Guid gameId, Player firstPlayer, int firstCell, Player secondPlayer, int secondCell)
    {
        service.MakeMove(gameId, new MoveRequest(firstPlayer, firstCell));
        service.MakeMove(gameId, new MoveRequest(secondPlayer, secondCell));
    }
}
