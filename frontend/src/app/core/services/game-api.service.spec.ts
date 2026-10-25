import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GameApiService } from './game-api.service';
import { GameSessionService } from './game-session.service';
import { sessionIdInterceptor } from '@core/interceptors/session-id.interceptor';
import { GameMode, GameState, Scoreboard } from '@core/models/game.models';

describe('GameApiService', () => {
  let service: GameApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameApiService,
        provideHttpClient(withInterceptors([sessionIdInterceptor])),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(GameApiService);
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(GameSessionService).start();
  });

  afterEach(() => http.verify());

  it('creates a game with the selected mode', () => {
    const response = {} as GameState;
    service.createGame('Computer').subscribe((game) => expect(game).toBe(response));

    const request = http.expectOne('/api/games');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('SESSION-ID')).toMatch(/^[0-9a-f-]{36}$/i);
    expect(request.request.body).toEqual({ mode: 'Computer' satisfies GameMode });
    request.flush(response);
  });

  it('submits moves, undo, and reset requests', () => {
    const response = {} as GameState;
    service.move({ player: 'X', cellIndex: 0 }).subscribe();
    service.undo().subscribe();
    service.resetGame().subscribe();

    const move = http.expectOne('/api/games/moves');
    expect(move.request.body).toEqual({ player: 'X', cellIndex: 0 });
    move.flush(response);
    http.expectOne('/api/games/undo').flush(response);
    http.expectOne('/api/games/reset').flush(response);
  });

  it('reads the SESSION-ID-bound current game', () => {
    const response = {} as GameState;
    service.getCurrentGame().subscribe((game) => expect(game).toBe(response));

    const request = http.expectOne('/api/games');
    expect(request.request.headers.get('SESSION-ID')).toMatch(/^[0-9a-f-]{36}$/i);
    request.flush(response);
  });

  it('reads and resets the scoreboard', () => {
    const response = { xWins: 1, oWins: 2, draws: 3 } satisfies Scoreboard;
    service.getScoreboard().subscribe((scoreboard) => expect(scoreboard).toEqual(response));
    http.expectOne('/api/scoreboard').flush(response);

    service.resetScoreboard().subscribe((scoreboard) => expect(scoreboard).toEqual(response));
    const reset = http.expectOne('/api/scoreboard/reset');
    expect(reset.request.method).toBe('POST');
    reset.flush(response);
  });
});
