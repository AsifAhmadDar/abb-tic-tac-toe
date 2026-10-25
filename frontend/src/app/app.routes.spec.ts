import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('application routes', () => {
  it('protects the game route with the session guard', () => {
    const gameRoute = routes.find((route) => route.path === 'game');

    expect(gameRoute?.canActivate).toHaveLength(1);
  });

  it('redirects the empty and unknown paths to home', () => {
    expect(routes.find((route) => route.path === '')?.redirectTo).toBe('home');
    expect(routes.find((route) => route.path === '**')?.redirectTo).toBe('home');
  });

  it('lazy-loads both feature screens', async () => {
    const homeRoute = routes.find((route) => route.path === 'home');
    const gameRoute = routes.find((route) => route.path === 'game');

    const homeModule = await homeRoute?.loadComponent?.();
    const gameModule = await gameRoute?.loadComponent?.();

    expect(homeModule).toBeTruthy();
    expect(gameModule).toBeTruthy();
  });
});
