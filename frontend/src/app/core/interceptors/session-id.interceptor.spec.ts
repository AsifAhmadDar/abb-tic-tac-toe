import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { sessionIdInterceptor } from './session-id.interceptor';
import { GameSessionService } from '@core/services/game-session.service';
import { HttpClient } from '@angular/common/http';

describe('sessionIdInterceptor', () => {
  it('adds SESSION-ID to API requests when a session exists', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([sessionIdInterceptor])),
        provideHttpClientTesting()
      ]
    });
    const sessionId = TestBed.inject(GameSessionService).start();
    const httpClient = TestBed.inject(HttpClient);
    const http = TestBed.inject(HttpTestingController);

    httpClient.get('/api/games').subscribe();
    const request = http.expectOne('/api/games');

    expect(request.request.headers.get('SESSION-ID')).toBe(sessionId);
    request.flush({});
    http.verify();
  });

  it('does not add SESSION-ID to non-API requests', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([sessionIdInterceptor])),
        provideHttpClientTesting()
      ]
    });
    TestBed.inject(GameSessionService).start();
    TestBed.inject(HttpClient).get('/assets/brandmark.svg').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/assets/brandmark.svg');

    expect(request.request.headers.has('SESSION-ID')).toBe(false);
    request.flush('svg');
  });
});
