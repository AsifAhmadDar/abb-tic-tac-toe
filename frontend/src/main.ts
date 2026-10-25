import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { sessionIdInterceptor } from '@core/interceptors/session-id.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([sessionIdInterceptor])),
    provideRouter(routes),
    provideZonelessChangeDetection()
  ]
}).catch((error: unknown) => console.error(error));
