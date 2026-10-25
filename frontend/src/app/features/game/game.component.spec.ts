import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { GameComponent } from './game.component';
import { GameApiService } from '@core/services/game-api.service';
import { GameSessionService } from '@core/services/game-session.service';
import { GameState } from '@core/models/game.models';

const createGame = (
  mode: 'TwoPlayer' | 'Computer' = 'TwoPlayer',
  status: 'InProgress' | 'Won' | 'Draw' = 'InProgress'
): GameState => ({
  gameId: 'session-1',
  board: Array(9).fill(null),
  currentPlayer: 'X',
  gameMode: mode,
  status,
  winner: status === 'Won' ? 'X' : null,
  winningCells: [],
  moves: [],
  scoreboard: { xWins: 0, oWins: 0, draws: 0 },
  sessionExpiresAt: new Date(Date.now() + 60_000).toISOString()
});

describe('GameComponent', () => {
  function configure(game: GameState = createGame()) {
    const sessionGame = signal<GameState | null>(game);
    const session = {
      game: sessionGame,
      errorMessage: signal(''),
      sessionExpired: signal(false),
      setError: vi.fn(),
      setGame: vi.fn((updatedGame: GameState) => sessionGame.set(updatedGame)),
      expire: vi.fn()
    };
    const api = {
      resetGame: vi.fn().mockReturnValue(of(createGame('Computer'))),
      move: vi.fn().mockReturnValue(of(game)),
      undo: vi.fn().mockReturnValue(of(game)),
      resetScoreboard: vi.fn().mockReturnValue(of(game.scoreboard))
    };

    return TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: GameApiService, useValue: api },
        { provide: GameSessionService, useValue: session },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } }
      ]
    }).compileComponents().then(() => {
      const fixture = TestBed.createComponent(GameComponent);
      fixture.detectChanges();
      return { fixture, api, session };
    });
  }

  it('opens confirmation before changing mode during an active game', async () => {
    const { fixture } = await configure();
    const component = fixture.componentInstance;

    component.requestModeChange('Computer');

    expect(component.pendingMode()).toBe('Computer');
  });

  it('resets the same session with the confirmed mode', async () => {
    const { fixture, api, session } = await configure();
    const component = fixture.componentInstance;
    component.requestModeChange('Computer');

    component.confirmModeChange();

    expect(api.resetGame).toHaveBeenCalledWith('Computer');
    expect(component.pendingMode()).toBeNull();
    expect(session.setGame).toHaveBeenCalled();
  });

  it('cancels a mode change without calling the API', async () => {
    const { fixture, api } = await configure();
    const component = fixture.componentInstance;
    component.requestModeChange('Computer');

    component.cancelModeChange();

    expect(component.pendingMode()).toBeNull();
    expect(api.resetGame).not.toHaveBeenCalled();
  });

  it('changes mode directly after the current game is complete', async () => {
    const { fixture, api } = await configure(createGame('TwoPlayer', 'Won'));

    fixture.componentInstance.requestModeChange('Computer');

    expect(api.resetGame).toHaveBeenCalledWith('Computer');
  });

  it('ignores a request for the current mode or while another request is busy', async () => {
    const { fixture, api } = await configure();
    const component = fixture.componentInstance;

    component.requestModeChange('TwoPlayer');
    component.busy.set(true);
    component.requestModeChange('Computer');

    expect(api.resetGame).not.toHaveBeenCalled();
  });

  it('submits a move for the current player and accepts the returned state', async () => {
    const { fixture, api, session } = await configure();

    fixture.componentInstance.play(0);

    expect(api.move).toHaveBeenCalledWith({ player: 'X', cellIndex: 0 });
    expect(session.setGame).toHaveBeenCalled();
  });

  it('does not submit a move for a disabled or occupied cell', async () => {
    const { fixture, api } = await configure();
    const game = fixture.componentInstance.game()!;
    game.board[0] = 'O';

    fixture.componentInstance.play(0);

    expect(api.move).not.toHaveBeenCalled();
  });

  it('undoes the last move when an in-progress game has move history', async () => {
    const game = createGame();
    game.moves = [{ moveNumber: 1, player: 'X', cellIndex: 0, row: 1, column: 1 }];
    const { fixture, api } = await configure(game);

    fixture.componentInstance.undo();

    expect(api.undo).toHaveBeenCalledOnce();
  });

  it('resets the current game without changing its mode', async () => {
    const { fixture, api } = await configure();

    fixture.componentInstance.resetGame();

    expect(api.resetGame).toHaveBeenCalledWith();
  });

  it('resets the scoreboard and updates the displayed totals', async () => {
    const { fixture, api } = await configure();
    api.resetScoreboard.mockReturnValue(of({ xWins: 2, oWins: 1, draws: 3 }));

    fixture.componentInstance.resetScoreboard();

    expect(api.resetScoreboard).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.scoreboard()).toEqual({ xWins: 2, oWins: 1, draws: 3 });
  });

  it('reports an API validation message without expiring the session', async () => {
    const { fixture, api, session } = await configure();
    api.move.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 409,
      error: { code: 'GAME_RULE_VIOLATION', message: 'The selected cell is already occupied.' }
    })));

    fixture.componentInstance.play(0);

    expect(session.setError).toHaveBeenCalledWith('The selected cell is already occupied.');
    expect(session.expire).not.toHaveBeenCalled();
  });

  it('expires the session when the API reports that the session is gone', async () => {
    const { fixture, api, session } = await configure();
    api.move.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 401,
      error: { code: 'SESSION_EXPIRED', message: 'Your session expired.' }
    })));

    fixture.componentInstance.play(0);

    expect(session.expire).toHaveBeenCalledWith('Your session expired.');
  });

  it('shows the fallback message when the API returns an unknown error', async () => {
    const { fixture, api, session } = await configure();
    api.resetGame.mockReturnValue(throwError(() => new Error('network down')));

    fixture.componentInstance.resetGame();

    expect(session.setError).toHaveBeenCalledWith('The game service is unavailable. Start the API and try again.');
  });

  it('describes in-progress, won, draw, and loading states', async () => {
    const { fixture, session } = await configure();
    const component = fixture.componentInstance;

    expect(component.statusTitle()).toBe("X's move");
    expect(component.statusEyebrow()).toBe("Player X to move");
    expect(component.isWinningCell(0)).toBe(false);

    session.game.set(createGame('TwoPlayer', 'Won'));
    fixture.detectChanges();
    expect(component.statusTitle()).toBe('X wins');
    expect(component.statusEyebrow()).toBe('Player X takes the line');

    session.game.set(createGame('TwoPlayer', 'Draw'));
    fixture.detectChanges();
    expect(component.statusTitle()).toBe('Draw game');
    expect(component.statusEyebrow()).toBe('A full board, no line');

    session.game.set({ ...createGame('Computer'), currentPlayer: 'O' });
    fixture.detectChanges();
    expect(component.statusEyebrow()).toBe('Computer is choosing');

    session.game.set(null);
    fixture.detectChanges();
    expect(component.statusTitle()).toBe('Waiting for the board');
    expect(component.statusEyebrow()).toBe('Connecting');
  });
});
