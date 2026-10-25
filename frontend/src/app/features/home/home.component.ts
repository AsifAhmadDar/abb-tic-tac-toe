import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { StopOutsideClickDirective } from '@core/directives/stop-outside-click.directive';
import { GameMode } from '@core/models/game.models';
import { GameApiService } from '@core/services/game-api.service';
import { GameSessionService } from '@core/services/game-session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [StopOutsideClickDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly api = inject(GameApiService);
  private readonly router = inject(Router);
  private readonly session = inject(GameSessionService);

  readonly selectedMode = signal<GameMode>('TwoPlayer');
  readonly busy = signal(false);
  readonly errorMessage = this.session.errorMessage;

  selectMode(mode: GameMode): void {
    if (!this.busy()) {
      this.selectedMode.set(mode);
    }
  }

  startGame(): void {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.session.setError('');
    this.session.start();
    this.api.createGame(this.selectedMode()).subscribe({
      next: (game) => {
        this.session.setGame(game);
        void this.router.navigateByUrl('/game');
      },
      error: (error: unknown) => this.handleError(error),
      complete: () => this.busy.set(false)
    });
  }

  private handleError(error: unknown): void {
    this.busy.set(false);
    this.session.clear();
    if (error instanceof HttpErrorResponse && error.error?.message) {
      this.session.setError(error.error.message);
      return;
    }
    this.session.setError('The game service is unavailable. Start the API and try again.');
  }
}
