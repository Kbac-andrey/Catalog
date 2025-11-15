import { ScoreBandPipe } from './score-band.pipe';
import { ScoreBandName } from '../models/score';

describe('ScoreBandPipe', () => {
  let pipe: ScoreBandPipe;

  beforeEach(() => {
    pipe = new ScoreBandPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return correct band for all score ranges', () => {
    expect(pipe.transform(0).name).toBe(ScoreBandName.Poor);
    expect(pipe.transform(49).name).toBe(ScoreBandName.Poor);
    expect(pipe.transform(50).name).toBe(ScoreBandName.Fair);
    expect(pipe.transform(74).name).toBe(ScoreBandName.Fair);
    expect(pipe.transform(75).name).toBe(ScoreBandName.Good);
    expect(pipe.transform(89).name).toBe(ScoreBandName.Good);
    expect(pipe.transform(90).name).toBe(ScoreBandName.Excellent);
    expect(pipe.transform(100).name).toBe(ScoreBandName.Excellent);
  });

  it('should round score before determining band', () => {
    expect(pipe.transform(49.5).name).toBe(ScoreBandName.Fair); // Rounds to 50
    expect(pipe.transform(74.7).name).toBe(ScoreBandName.Good); // Rounds to 75
  });

  it('should return default band (Poor) for invalid scores', () => {
    expect(pipe.transform(-10).name).toBe(ScoreBandName.Poor);
    expect(pipe.transform(NaN).name).toBe(ScoreBandName.Poor);
  });
});

