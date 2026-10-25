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
  it('allows navigation when the API returns the current game', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const http = TestBed.inject(HttpTestingController);
    const session = TestBed.inject(GameSessionService);
    session.start();
    const game = { gameId: 'game-1' } as GameState;
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
});
