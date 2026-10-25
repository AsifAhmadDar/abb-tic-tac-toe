import { Routes } from '@angular/router';
import { gameSessionGuard } from '@core/guards/game-session.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    loadComponent: () => import('@features/home/home.component').then((module) => module.HomeComponent)
  },
  {
    path: 'game',
    canActivate: [gameSessionGuard],
    loadComponent: () => import('@features/game/game.component').then((module) => module.GameComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
