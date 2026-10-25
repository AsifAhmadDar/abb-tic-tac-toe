import { describe, expect, it } from 'vitest';
import { GameModeLabelPipe } from './game-mode-label.pipe';

describe('GameModeLabelPipe', () => {
  it('labels computer mode as solo computer', () => {
    expect(new GameModeLabelPipe().transform('Computer')).toBe('Solo / computer');
  });

  it('labels two-player and empty modes as two player', () => {
    const pipe = new GameModeLabelPipe();

    expect(pipe.transform('TwoPlayer')).toBe('Two player');
    expect(pipe.transform(null)).toBe('Two player');
    expect(pipe.transform(undefined)).toBe('Two player');
  });
});
