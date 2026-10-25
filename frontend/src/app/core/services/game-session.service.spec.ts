import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameState } from '@core/models/game.models';
import { GameSessionService } from './game-session.service';

const createGame = (sessionExpiresAt: string): GameState => ({
  gameId: 'session-1',
  board: Array(9).fill(null),
  currentPlayer: 'X',
  gameMode: 'TwoPlayer',
  status: 'InProgress',
  winner: null,
  winningCells: [],
  moves: [],
  scoreboard: { xWins: 0, oWins: 0, draws: 0 },
  sessionExpiresAt
});

describe('GameSessionService', () => {
  beforeEach(() => sessionStorage.clear());

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('persists the generated session id and restores it on construction', () => {
    const first = new GameSessionService();
    const sessionId = first.start();

    const restored = new GameSessionService();

    expect(restored.sessionId()).toBe(sessionId);
    expect(sessionStorage.getItem('tic-tac-toe-session-id')).toBe(sessionId);
  });

  it('uses the cached game when session details are available', () => {
    const service = new GameSessionService();
    service.start();
    service.setGame(createGame(new Date(Date.now() + 60_000).toISOString()));

    expect(service.hasCachedSession()).toBe(true);
    expect(service.sessionDetails()?.expiresAt).toBeTruthy();
  });

  it('removes expired session data automatically', () => {
    vi.useFakeTimers();
    const service = new GameSessionService();
    service.start();
    service.setGame(createGame(new Date(Date.now() + 1_000).toISOString()));

    vi.advanceTimersByTime(1_001);

    expect(service.sessionId()).toBeNull();
    expect(service.sessionDetails()).toBeNull();
    expect(service.sessionExpired()).toBe(true);
    expect(sessionStorage.getItem('tic-tac-toe-session-id')).toBeNull();
  });
});
