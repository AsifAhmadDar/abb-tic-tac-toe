import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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

  if (session.hasCachedSession()) {
    return true;
  }

  return api.getCurrentGame().pipe(
    tap((game) => session.setGame(game)),
    map(() => true),
    catchError((error: unknown) => {
      const message = error instanceof HttpErrorResponse &&
        (error.error?.code === 'SESSION_EXPIRED' || error.error?.code === 'SESSION_NOT_FOUND')
        ? error.error.message
        : '';
      session.clear(message);
      return of(router.createUrlTree(['/home']));
    })
  );
};
