import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StopOutsideClickDirective } from './stop-outside-click.directive';
import { beforeEach, describe, expect, it } from 'vitest';

@Component({
  standalone: true,
  imports: [StopOutsideClickDirective],
  template: `
    <div
      [appStopOutsideClick]="enabled"
      (outsideClick)="outsideClickCount = outsideClickCount + 1">
      Inside
    </div>
    <button type="button">Outside</button>
  `
})
class DirectiveHostComponent {
  enabled = true;
  outsideClickCount = 0;
}

describe('StopOutsideClickDirective', () => {
  let fixture: ComponentFixture<DirectiveHostComponent>;
  let host: DirectiveHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectiveHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DirectiveHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits when an enabled directive receives an outside click', () => {
    fixture.nativeElement.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(host.outsideClickCount).toBe(1);
  });

  it('does not emit when outside-click handling is disabled', () => {
    const directive = fixture.debugElement
      .query(By.directive(StopOutsideClickDirective))
      .injector.get(StopOutsideClickDirective);
    directive.appStopOutsideClick = false;
    fixture.nativeElement.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(host.outsideClickCount).toBe(0);
  });

  it('does not emit for clicks inside the host element', () => {
    fixture.nativeElement.querySelector('div').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(host.outsideClickCount).toBe(0);
  });
});
