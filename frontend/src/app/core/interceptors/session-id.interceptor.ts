import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { GameSessionService } from '@core/services/game-session.service';

export const sessionIdInterceptor: HttpInterceptorFn = (request, next) => {
  const sessionId = inject(GameSessionService).sessionId();

  if (!sessionId || !request.url.startsWith('/api/')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { 'SESSION-ID': sessionId }
  }));
};
