import { DOCUMENT } from '@angular/common';
import { Injectable, Renderer2, RendererFactory2, inject, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'tic-tac-toe-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  readonly theme = signal<Theme>(this.readInitialTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.applyTheme(theme);
    this.theme.set(theme);
    this.persistTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    this.renderer.setAttribute(this.document.documentElement, 'data-theme', theme);
  }

  private readInitialTheme(): Theme {
    if (typeof localStorage === 'undefined') {
      return 'dark';
    }

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' ? 'light' : 'dark';
  }

  private persistTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }
}
