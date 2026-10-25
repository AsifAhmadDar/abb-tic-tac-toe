import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameSessionService } from '@core/services/game-session.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly session = inject(GameSessionService);
  private readonly themeService = inject(ThemeService);

  readonly theme = this.themeService.theme;
  readonly game = this.session.game;
  readonly errorMessage = this.session.errorMessage;

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
