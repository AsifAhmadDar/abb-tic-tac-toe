import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { HomeComponent } from './home.component';
import { GameApiService } from '@core/services/game-api.service';
import { GameSessionService } from '@core/services/game-session.service';

describe('HomeComponent', () => {
  it('starts a selected game mode and navigates to the game route', async () => {
    const game = { gameMode: 'Computer' } as never;
    const createGame = vi.fn().mockReturnValue(of(game));
    const start = vi.fn().mockReturnValue('session-1');
    const setGame = vi.fn();
    const navigateByUrl = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: GameApiService, useValue: { createGame } },
        { provide: GameSessionService, useValue: { errorMessage: signal(''), start, setError: vi.fn(), setGame, clear: vi.fn() } },
        { provide: Router, useValue: { navigateByUrl } }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.selectMode('Computer');
    component.startGame();

    expect(start).toHaveBeenCalledOnce();
    expect(createGame).toHaveBeenCalledWith('Computer');
    expect(setGame).toHaveBeenCalledWith(game);
    expect(navigateByUrl).toHaveBeenCalledWith('/game');
  });

  it('ignores mode selection while a game is being started', async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: GameApiService, useValue: { createGame: vi.fn().mockReturnValue(of({})) } },
        { provide: GameSessionService, useValue: { errorMessage: signal(''), start: vi.fn(), setError: vi.fn(), setGame: vi.fn(), clear: vi.fn() } },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.busy.set(true);

    component.selectMode('Computer');

    expect(component.selectedMode()).toBe('TwoPlayer');
  });

  it('does not submit another start request while busy', async () => {
    const createGame = vi.fn().mockReturnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: GameApiService, useValue: { createGame } },
        { provide: GameSessionService, useValue: { errorMessage: signal(''), start: vi.fn(), setError: vi.fn(), setGame: vi.fn(), clear: vi.fn() } },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.busy.set(true);

    component.startGame();

    expect(createGame).not.toHaveBeenCalled();
  });

  it('clears the session and displays the API error when creation fails', async () => {
    const clear = vi.fn();
    const setError = vi.fn();
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: GameApiService, useValue: { createGame: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'That session is already in use.' } }))) } },
        { provide: GameSessionService, useValue: { errorMessage: signal(''), start: vi.fn(), setError, setGame: vi.fn(), clear } },
        { provide: Router, useValue: { navigateByUrl: vi.fn() } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    fixture.componentInstance.startGame();

    expect(clear).toHaveBeenCalledOnce();
    expect(setError).toHaveBeenCalledWith('That session is already in use.');
  });
});
