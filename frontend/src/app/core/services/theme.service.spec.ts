import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies and persists the selected theme', () => {
    const service = TestBed.inject(ThemeService);
    const documentRef = TestBed.inject(DOCUMENT);

    service.setTheme('light');

    expect(service.theme()).toBe('light');
    expect(documentRef.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('tic-tac-toe-theme')).toBe('light');
  });

  it('toggles between dark and light themes', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme('dark');
    service.toggle();
    expect(service.theme()).toBe('light');

    service.toggle();
    expect(service.theme()).toBe('dark');
  });
});
