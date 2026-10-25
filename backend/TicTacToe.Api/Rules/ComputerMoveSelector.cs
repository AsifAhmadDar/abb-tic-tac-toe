using TicTacToe.Api.Models;

namespace TicTacToe.Api.Rules;

public static class ComputerMoveSelector
{
    private static readonly int[] Corners = [0, 2, 6, 8];

    public static int SelectMove(IReadOnlyList<Player?> board)
    {
        var winningMove = FindFinishingMove(board, Player.O);
        if (winningMove is not null)
        {
            return winningMove.Value;
        }

        var blockingMove = FindFinishingMove(board, Player.X);
        if (blockingMove is not null)
        {
            return blockingMove.Value;
        }

        if (board[4] is null)
        {
            return 4;
        }

        var corner = Corners.FirstOrDefault(index => board[index] is null, -1);
        if (corner >= 0)
        {
            return corner;
        }

        return Enumerable.Range(0, board.Count).First(index => board[index] is null);
    }

    private static int? FindFinishingMove(IReadOnlyList<Player?> board, Player player)
    {
        foreach (var index in Enumerable.Range(0, board.Count).Where(index => board[index] is null))
        {
            var candidate = board.ToArray();
            candidate[index] = player;
            if (GameRules.FindWinningLine(candidate, player).Length > 0)
            {
                return index;
            }
        }

        return null;
    }
}
