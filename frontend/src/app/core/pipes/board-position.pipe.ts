import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boardPosition',
  standalone: true
})
export class BoardPositionPipe implements PipeTransform {
  transform(cellIndex: number): string {
    return `Row ${Math.floor(cellIndex / 3) + 1}, column ${(cellIndex % 3) + 1}`;
  }
}
