import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameMode, GameState, MoveRequest, Scoreboard } from '@core/models/game.models';

@Injectable({ providedIn: 'root' })
export class GameApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  createGame(mode: GameMode): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/games`, { mode });
  }

  getCurrentGame(): Observable<GameState> {
    return this.http.get<GameState>(`${this.apiUrl}/games`);
  }

  move(request: MoveRequest): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/games/moves`, request);
  }

  undo(): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/games/undo`, {});
  }

  resetGame(): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/games/reset`, {});
  }

  getScoreboard(): Observable<Scoreboard> {
    return this.http.get<Scoreboard>(`${this.apiUrl}/scoreboard`);
  }

  resetScoreboard(): Observable<Scoreboard> {
    return this.http.post<Scoreboard>(`${this.apiUrl}/scoreboard/reset`, {});
  }
}
