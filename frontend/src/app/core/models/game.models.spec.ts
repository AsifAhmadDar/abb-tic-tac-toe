import { describe, expect, it } from 'vitest';
import { GameState, MoveRequest, SessionDetails } from './game.models';

describe('game model contracts', () => {
  it('represents a move request with player and cell index', () => {
    const request = { player: 'X', cellIndex: 4 } satisfies MoveRequest;

    expect(request).toEqual({ player: 'X', cellIndex: 4 });
  });

  it('represents a session response with game state and expiry metadata', () => {
    const details = { expiresAt: new Date(Date.now() + 60_000).toISOString() } satisfies SessionDetails;
    const game = {
      gameId: 'session-1',
      board: Array(9).fill(null),
      currentPlayer: 'X',
      gameMode: 'TwoPlayer',
      status: 'InProgress',
      winner: null,
      winningCells: [],
      moves: [],
      scoreboard: { xWins: 0, oWins: 0, draws: 0 },
      sessionExpiresAt: details.expiresAt
    } satisfies GameState;

    expect(game.sessionExpiresAt).toBe(details.expiresAt);
  });
});
