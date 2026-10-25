export type Player = 'X' | 'O';
export type GameMode = 'TwoPlayer' | 'Computer';
export type GameStatus = 'InProgress' | 'Won' | 'Draw';

export interface MoveRecord {
  moveNumber: number;
  player: Player;
  cellIndex: number;
  row: number;
  column: number;
}

export interface Scoreboard {
  xWins: number;
  oWins: number;
  draws: number;
}

export interface GameState {
  gameId: string;
  board: Array<Player | null>;
  currentPlayer: Player;
  gameMode: GameMode;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[];
  moves: MoveRecord[];
  scoreboard: Scoreboard;
  sessionExpiresAt: string;
}

export interface SessionDetails {
  expiresAt: string;
}

export interface MoveRequest {
  player: Player;
  cellIndex: number;
}
