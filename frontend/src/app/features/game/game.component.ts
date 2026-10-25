import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BoardPositionPipe } from '@core/pipes/board-position.pipe';
import { GameModeLabelPipe } from '@core/pipes/game-mode-label.pipe';
import { GameMode, GameState } from '@core/models/game.models';
import { GameApiService } from '@core/services/game-api.service';
import { GameSessionService } from '@core/services/game-session.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [DecimalPipe, BoardPositionPipe, GameModeLabelPipe],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameComponent {
  private readonly api = inject(GameApiService);
  private readonly session = inject(GameSessionService);

  readonly cells = Array.from({ length: 9 }, (_, index) => index);
  readonly game = this.session.game;
  readonly scoreboard = signal(this.game()?.scoreboard ?? { xWins: 0, oWins: 0, draws: 0 });
  readonly busy = signal(false);
  readonly errorMessage = this.session.errorMessage;

  startGame(mode: GameMode): void {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.session.setError('');
    this.api.createGame(mode).subscribe({
      next: (game) => this.acceptGame(game),
      error: (error: unknown) => this.handleError(error),
      complete: () => this.busy.set(false)
    });
  }

  play(cellIndex: number): void {
    const game = this.game();
    if (!game || this.busy() || game.status !== 'InProgress' || game.board[cellIndex] !== null) {
      return;
    }

    this.busy.set(true);
    this.session.setError('');
    this.api.move({ player: game.currentPlayer, cellIndex }).subscribe({
      next: (updatedGame) => this.acceptGame(updatedGame),
      error: (error: unknown) => this.handleError(error),
      complete: () => this.busy.set(false)
    });
  }

  undo(): void {
    const game = this.game();
    if (!game || this.busy() || game.moves.length === 0 || game.status !== 'InProgress') {
      return;
    }

    this.busy.set(true);
    this.session.setError('');
    this.api.undo().subscribe({
      next: (updatedGame) => this.acceptGame(updatedGame),
      error: (error: unknown) => this.handleError(error),
      complete: () => this.busy.set(false)
    });
  }

  resetGame(): void {
    if (!this.game() || this.busy()) {
      return;
    }

    this.busy.set(true);
    this.session.setError('');
    this.api.resetGame().subscribe({
      next: (updatedGame) => this.acceptGame(updatedGame),
      error: (error: unknown) => this.handleError(error),
      complete: () => this.busy.set(false)
    });
  }

  resetScoreboard(): void {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.session.setError('');
    this.api.resetScoreboard().subscribe({
      next: (scoreboard) => {
        this.scoreboard.set(scoreboard);
        this.session.game.update((game) => game ? { ...game, scoreboard } : game);
      },
      error: (error: unknown) => this.handleError(error),
      complete: () => this.busy.set(false)
    });
  }

  isWinningCell(cellIndex: number): boolean {
    return this.game()?.winningCells.includes(cellIndex) ?? false;
  }

  statusEyebrow(): string {
    const game = this.game();
    if (!game) {
      return 'Connecting';
    }
    if (game.status === 'Won') {
      return `Player ${game.winner} takes the line`;
    }
    if (game.status === 'Draw') {
      return 'A full board, no line';
    }
    return game.gameMode === 'Computer' && game.currentPlayer === 'O'
      ? 'Computer is choosing'
      : `Player ${game.currentPlayer} to move`;
  }

  statusTitle(): string {
    const game = this.game();
    if (!game) {
      return 'Waiting for the board';
    }
    if (game.status === 'Won') {
      return `${game.winner} wins`;
    }
    if (game.status === 'Draw') {
      return 'Draw game';
    }
    return `${game.currentPlayer}'s move`;
  }

  private acceptGame(game: GameState): void {
    this.session.setGame(game);
    this.scoreboard.set(game.scoreboard);
  }

  private handleError(error: unknown): void {
    this.busy.set(false);
    if (error instanceof HttpErrorResponse && error.error?.message) {
      this.session.setError(error.error.message);
      return;
    }
    this.session.setError('The game service is unavailable. Start the API and try again.');
  }
}
