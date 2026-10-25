import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmationPopupComponent } from './confirmation-popup.component';

describe('ConfirmationPopupComponent', () => {
  it('renders the supplied title, message, and action labels', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmationPopupComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmationPopupComponent);
    fixture.componentRef.setInput('title', 'Change game mode?');
    fixture.componentRef.setInput('message', 'The board will be reset.');
    fixture.componentRef.setInput('confirmLabel', 'Reset and change');
    fixture.componentRef.setInput('cancelLabel', 'Keep playing');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Change game mode?');
    expect(fixture.nativeElement.textContent).toContain('The board will be reset.');
    expect(fixture.nativeElement.textContent).toContain('Reset and change');
    expect(fixture.nativeElement.textContent).toContain('Keep playing');
  });

  it('emits confirmation and cancellation actions from the respective methods', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmationPopupComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmationPopupComponent);
    let confirmed = 0;
    let cancelled = 0;
    fixture.componentInstance.confirmed.subscribe(() => confirmed++);
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);

    fixture.componentInstance.confirm();
    fixture.componentInstance.cancel();

    expect(confirmed).toBe(1);
    expect(cancelled).toBe(1);
  });

  it('prevents native dismissal and emits cancellation for the Escape action', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmationPopupComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmationPopupComponent);
    const preventDefault = vi.fn();
    let cancelled = 0;
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);

    fixture.componentInstance.handleCancel({ preventDefault } as unknown as Event);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(cancelled).toBe(1);
  });

  it('emits cancellation when the modal backdrop is clicked', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmationPopupComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmationPopupComponent);
    let cancelled = 0;
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);
    const backdrop = {} as EventTarget;

    fixture.componentInstance.handleDialogClick({ target: backdrop, currentTarget: backdrop } as unknown as MouseEvent);

    expect(cancelled).toBe(1);
  });

  it('does not emit cancellation when a dialog control is clicked', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmationPopupComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmationPopupComponent);
    let cancelled = 0;
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);
    const dialog = {} as EventTarget;

    fixture.componentInstance.handleDialogClick({ target: dialog, currentTarget: {} } as unknown as MouseEvent);

    expect(cancelled).toBe(0);
  });
});
