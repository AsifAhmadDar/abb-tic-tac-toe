import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';
import { GameApiService } from '@core/services/game-api.service';
import { GameSessionService } from '@core/services/game-session.service';

export const gameSessionGuard: CanActivateFn = () => {
  const api = inject(GameApiService);
  const session = inject(GameSessionService);
  const router = inject(Router);

  if (!session.sessionId()) {
    return router.createUrlTree(['/home']);
  }

  return api.getCurrentGame().pipe(
    tap((game) => session.setGame(game)),
    map(() => true),
    catchError(() => {
      session.clear();
      return of(router.createUrlTree(['/home']));
    })
  );
};
