using TicTacToe.Api.Models;

namespace TicTacToe.Api.Rules;

public static class GameRules
{
    private static readonly int[][] WinningLines =
    [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    public static int[] FindWinningLine(IReadOnlyList<Player?> board, Player player) =>
        WinningLines.FirstOrDefault(line => line.All(index => board[index] == player)) ?? [];

    public static bool IsDraw(IReadOnlyList<Player?> board) => board.All(cell => cell is not null);
}
