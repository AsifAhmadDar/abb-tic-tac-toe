import { describe, expect, it } from 'vitest';
import { BoardPositionPipe } from './board-position.pipe';

describe('BoardPositionPipe', () => {
  it('formats the first cell as row 1 column 1', () => {
    expect(new BoardPositionPipe().transform(0)).toBe('Row 1, column 1');
  });

  it('formats the last cell as row 3 column 3', () => {
    expect(new BoardPositionPipe().transform(8)).toBe('Row 3, column 3');
  });
});
