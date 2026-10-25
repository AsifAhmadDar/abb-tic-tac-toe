import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild
} from '@angular/core';

@Component({
  selector: 'app-confirmation-popup',
  standalone: true,
  templateUrl: './confirmation-popup.component.html',
  styleUrl: './confirmation-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationPopupComponent {
  readonly open = input(false);
  readonly title = input('Confirm action');
  readonly message = input('Are you sure you want to continue?');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  private readonly dialogStateEffect = effect(() => {
    const dialog = this.dialog()?.nativeElement;
    if (!dialog) {
      return;
    }

    if (this.open() && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!this.open() && dialog.open) {
      dialog.close();
    }
  });

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }

  handleCancel(event: Event): void {
    event.preventDefault();
    this.cancel();
  }

  handleDialogClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }
}
