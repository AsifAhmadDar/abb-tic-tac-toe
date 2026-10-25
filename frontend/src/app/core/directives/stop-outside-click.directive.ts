import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, EventEmitter, Input, Output, inject } from '@angular/core';

@Directive({
  selector: '[appStopOutsideClick]',
  standalone: true
})
export class StopOutsideClickDirective {
  private readonly document = inject(DOCUMENT);
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  @Input() appStopOutsideClick = true;
  @Output() readonly outsideClick = new EventEmitter<MouseEvent>();

  constructor() {
    const listener = (event: MouseEvent): void => {
      this.onDocumentClick(event);
    };

    this.document.addEventListener('click', listener, true);
    this.destroyRef.onDestroy(() => this.document.removeEventListener('click', listener, true));
  }

  private onDocumentClick(event: MouseEvent): void {
    if (!this.appStopOutsideClick || this.element.nativeElement.contains(event.target as Node)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.outsideClick.emit(event);
  }
}
