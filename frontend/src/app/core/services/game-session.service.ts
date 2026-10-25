import { Injectable, signal } from '@angular/core';
import { GameState } from '@core/models/game.models';

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  readonly sessionId = signal<string | null>(null);
  readonly game = signal<GameState | null>(null);
  readonly errorMessage = signal('');

  start(): string {
    const sessionId = crypto.randomUUID();
    this.sessionId.set(sessionId);
    this.game.set(null);
    this.errorMessage.set('');
    return sessionId;
  }

  setGame(game: GameState): void {
    this.game.set(game);
    this.errorMessage.set('');
  }

  setError(message: string): void {
    this.errorMessage.set(message);
  }

  clear(): void {
    this.sessionId.set(null);
    this.game.set(null);
    this.errorMessage.set('');
  }
}
