import { Pipe, PipeTransform } from '@angular/core';
import { GameMode } from '@core/models/game.models';

@Pipe({
  name: 'gameModeLabel',
  standalone: true
})
export class GameModeLabelPipe implements PipeTransform {
  transform(mode: GameMode | null | undefined): string {
    return mode === 'Computer' ? 'Solo / computer' : 'Two player';
  }
}
