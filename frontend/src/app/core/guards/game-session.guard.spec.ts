import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { gameSessionGuard } from '@core/guards/game-session.guard';
import { GameState } from '@core/models/game.models';
import { GameSessionService } from '@core/services/game-session.service';

const routeSnapshot = {} as ActivatedRouteSnapshot;
const routerStateSnapshot = {} as RouterStateSnapshot;

describe('gameSessionGuard', () => {
  it('redirects to home immediately when no session id is available', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.inject(GameSessionService).clear();

    const result = TestBed.runInInjectionContext(() =>
      gameSessionGuard(routeSnapshot, routerStateSnapshot)
    );

    expect((result as UrlTree).toString()).toBe('/home');
  });

  it('allows navigation from the cached session without making a restore request', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const http = TestBed.inject(HttpTestingController);
    const session = TestBed.inject(GameSessionService);
    session.start();
    session.setGame({
      gameId: 'game-1',
      sessionExpiresAt: new Date(Date.now() + 60_000).toISOString(),
      board: Array(9).fill(null),
      currentPlayer: 'X',
      gameMode: 'TwoPlayer',
      status: 'InProgress',
      winner: null,
      winningCells: [],
      moves: [],
      scoreboard: { xWins: 0, oWins: 0, draws: 0 }
    });

    const result = TestBed.runInInjectionContext(() =>
      gameSessionGuard(routeSnapshot, routerStateSnapshot)
    );

    expect(result).toBe(true);
    http.verify();
  });

  it('allows navigation when the API returns the current game', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const http = TestBed.inject(HttpTestingController);
    const session = TestBed.inject(GameSessionService);
    session.start();
    const game = {
      gameId: 'game-1',
      sessionExpiresAt: new Date(Date.now() + 60_000).toISOString()
    } as GameState;
    let result: boolean | UrlTree | undefined;

    TestBed.runInInjectionContext(() => {
      (gameSessionGuard(routeSnapshot, routerStateSnapshot) as Observable<boolean | UrlTree>)
        .subscribe((value) => result = value);
    });

    http.expectOne('/api/games').flush(game);

    expect(result).toBe(true);
    expect(session.game()).toBe(game);
  });

  it('redirects to home when the API has no active session', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(GameSessionService).start();
    let result: boolean | UrlTree | undefined;

    TestBed.runInInjectionContext(() => {
      (gameSessionGuard(routeSnapshot, routerStateSnapshot) as Observable<boolean | UrlTree>)
        .subscribe((value) => result = value);
    });

    http.expectOne('/api/games').flush(
      { message: 'No active session.' },
      { status: 404, statusText: 'Not Found' }
    );

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/home');
  });

  it('shows the server expiry message when the restore request reports an expired session', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const http = TestBed.inject(HttpTestingController);
    const session = TestBed.inject(GameSessionService);
    session.start();
    let result: boolean | UrlTree | undefined;

    TestBed.runInInjectionContext(() => {
      (gameSessionGuard(routeSnapshot, routerStateSnapshot) as Observable<boolean | UrlTree>)
        .subscribe((value) => result = value);
    });

    http.expectOne('/api/games').flush(
      { code: 'SESSION_EXPIRED', message: 'Your session expired.' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect((result as UrlTree).toString()).toBe('/home');
    expect(session.errorMessage()).toBe('Your session expired.');
  });
});
