import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { HeaderComponent } from './header.component';
import { ThemeService } from '@core/services/theme.service';
import { GameSessionService } from '@core/services/game-session.service';

describe('HeaderComponent', () => {
  it('toggles the theme when the theme control is activated', async () => {
    const toggle = vi.fn();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: ThemeService, useValue: { theme: signal('dark'), toggle } },
        { provide: GameSessionService, useValue: { game: signal(null), errorMessage: signal('') } }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(HeaderComponent);

    fixture.nativeElement.querySelector('.theme-toggle').click();

    expect(toggle).toHaveBeenCalledOnce();
  });
});
