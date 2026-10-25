namespace TicTacToe.Api.Models;

public sealed class GameSession(Guid gameId, GameMode gameMode, DateTimeOffset expiresAt)
{
    public Guid GameId { get; } = gameId;
    public GameMode GameMode { get; private set; } = gameMode;
    public DateTimeOffset ExpiresAt { get; private set; } = expiresAt;
    public object SyncRoot { get; } = new();
    public Player?[] Board { get; } = new Player?[9];
    internal List<GameMove> Moves { get; } = [];
    public Player CurrentPlayer { get; set; } = Player.X;
    public GameStatus Status { get; set; } = GameStatus.InProgress;
    public Player? Winner { get; set; }
    public List<int> WinningCells { get; } = [];
    public bool ResultRecorded { get; set; }

    internal void Restore(IReadOnlyList<GameMove> moves)
    {
        Array.Fill(Board, null);
        Moves.Clear();
        Moves.AddRange(moves);
        foreach (var move in Moves)
        {
            Board[move.CellIndex] = move.Player;
        }

        Status = GameStatus.InProgress;
        Winner = null;
        WinningCells.Clear();
        CurrentPlayer = GameMode == GameMode.Computer
            ? Player.X
            : Moves.LastOrDefault()?.Player == Player.X ? Player.O : Player.X;
    }

    public void Reset(GameMode mode, DateTimeOffset expiresAt)
    {
        GameMode = mode;
        ExpiresAt = expiresAt;
        Array.Fill(Board, null);
        Moves.Clear();
        WinningCells.Clear();
        CurrentPlayer = Player.X;
        Status = GameStatus.InProgress;
        Winner = null;
        ResultRecorded = false;
    }
}
