import { Injectable, signal } from '@angular/core';
import { GameState, SessionDetails } from '@core/models/game.models';

const SESSION_ID_STORAGE_KEY = 'tic-tac-toe-session-id';
const SESSION_DETAILS_STORAGE_KEY = 'tic-tac-toe-session-details';

@Injectable({ providedIn: 'root' })
export class GameSessionService {
  readonly sessionId = signal<string | null>(this.readSessionId());
  readonly sessionDetails = signal<SessionDetails | null>(this.readSessionDetails());
  readonly game = signal<GameState | null>(null);
  readonly errorMessage = signal('');
  readonly sessionExpired = signal(false);
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!this.sessionId()) {
      this.sessionDetails.set(null);
      this.storage()?.removeItem(SESSION_DETAILS_STORAGE_KEY);
      return;
    }

    if (this.isExpired(this.sessionDetails())) {
      this.expire();
    } else {
      this.scheduleExpiry(this.sessionDetails());
    }
  }

  start(): string {
    const sessionId = crypto.randomUUID();
    this.clearExpiryTimer();
    this.sessionId.set(sessionId);
    this.sessionDetails.set(null);
    this.game.set(null);
    this.errorMessage.set('');
    this.sessionExpired.set(false);
    this.storage()?.setItem(SESSION_ID_STORAGE_KEY, sessionId);
    this.storage()?.removeItem(SESSION_DETAILS_STORAGE_KEY);
    return sessionId;
  }

  setGame(game: GameState): void {
    this.game.set(game);
    this.errorMessage.set('');
    const details = { expiresAt: game.sessionExpiresAt } satisfies SessionDetails;
    this.sessionDetails.set(details);
    this.storage()?.setItem(SESSION_DETAILS_STORAGE_KEY, JSON.stringify(details));
    this.scheduleExpiry(details);
    this.sessionExpired.set(false);
  }

  setError(message: string): void {
    this.errorMessage.set(message);
  }

  clear(message = ''): void {
    this.clearExpiryTimer();
    this.sessionId.set(null);
    this.sessionDetails.set(null);
    this.game.set(null);
    this.errorMessage.set(message);
    this.sessionExpired.set(false);
    this.storage()?.removeItem(SESSION_ID_STORAGE_KEY);
    this.storage()?.removeItem(SESSION_DETAILS_STORAGE_KEY);
  }

  expire(message = 'Your game session has expired. Start a new game.'): void {
    this.clearExpiryTimer();
    this.sessionId.set(null);
    this.sessionDetails.set(null);
    this.game.set(null);
    this.errorMessage.set(message);
    this.sessionExpired.set(true);
    this.storage()?.removeItem(SESSION_ID_STORAGE_KEY);
    this.storage()?.removeItem(SESSION_DETAILS_STORAGE_KEY);
  }

  hasCachedSession(): boolean {
    if (!this.sessionId() || !this.sessionDetails() || !this.game()) {
      return false;
    }

    if (this.isExpired(this.sessionDetails())) {
      this.expire();
      return false;
    }

    return true;
  }

  private scheduleExpiry(details: SessionDetails | null): void {
    this.clearExpiryTimer();
    if (!details) {
      return;
    }

    const remaining = Date.parse(details.expiresAt) - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) {
      this.expire();
      return;
    }

    const maxTimerDelay = 2_147_000_000;
    this.expiryTimer = setTimeout(
      () => this.scheduleExpiry(this.sessionDetails()),
      Math.min(remaining, maxTimerDelay)
    );
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer !== null) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private isExpired(details: SessionDetails | null): boolean {
    return details !== null &&
      (!Number.isFinite(Date.parse(details.expiresAt)) || Date.parse(details.expiresAt) <= Date.now());
  }

  private readSessionId(): string | null {
    return this.storage()?.getItem(SESSION_ID_STORAGE_KEY) ?? null;
  }

  private readSessionDetails(): SessionDetails | null {
    const raw = this.storage()?.getItem(SESSION_DETAILS_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const details = JSON.parse(raw) as SessionDetails;
      if (!details.expiresAt || Number.isNaN(Date.parse(details.expiresAt))) {
        this.storage()?.removeItem(SESSION_DETAILS_STORAGE_KEY);
        return null;
      }
      return details;
    } catch {
      this.storage()?.removeItem(SESSION_DETAILS_STORAGE_KEY);
      return null;
    }
  }

  private storage(): Storage | null {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  }
}
