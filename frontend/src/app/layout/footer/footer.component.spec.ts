import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  it('renders the application footer', async () => {
    await TestBed.configureTestingModule({ imports: [FooterComponent] }).compileComponents();
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('footer')).toBeTruthy();
  });
});
