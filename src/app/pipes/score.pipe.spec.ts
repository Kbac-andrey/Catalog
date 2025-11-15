import { ScorePipe } from './score.pipe';
import { ICatalogItem } from '../models/catalog.';

describe('ScorePipe', () => {
  let pipe: ScorePipe;

  beforeEach(() => {
    pipe = new ScorePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return computed score for valid catalog item', () => {
    const item: ICatalogItem = {
      id: '1',
      title: 'This is a long title that exceeds twelve characters',
      description: 'A test item description',
      category: 'Electronics',
      tags: ['tag1', 'tag2'],
      creator: 'test@example.com',
      createdAt: '2025-01-10T10:00:00.000Z',
      approved: false
    };
    const score = pipe.transform(item);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should return 0 for null item', () => {
    const score = pipe.transform(null);
    expect(score).toBe(0);
  });

  it('should return 0 for undefined item', () => {
    const score = pipe.transform(undefined);
    expect(score).toBe(0);
  });

  it('should return base score of 40 for minimal item', () => {
    const item: ICatalogItem = {
      id: '1',
      title: 'Short',
      description: 'Short desc',
      category: '',
      tags: [],
      creator: 'test@example.com',
      createdAt: '2025-01-10T10:00:00.000Z',
      approved: false
    };
    const score = pipe.transform(item);
    expect(score).toBe(40);
  });
});

