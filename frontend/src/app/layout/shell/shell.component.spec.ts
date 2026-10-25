import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  it('creates the application shell', async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
