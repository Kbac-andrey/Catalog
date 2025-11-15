import { computeScore } from './compute-score';
import { ICatalogItem } from '../../models/catalog.';

describe('computeScore', () => {
  const baseItem: ICatalogItem = {
    id: '1',
    title: 'Short',
    description: 'Short desc',
    category: '',
    tags: [],
    creator: 'test@example.com',
    createdAt: '2025-01-10T10:00:00.000Z',
    approved: false
  };

  it('should return base score of 40 for minimal item', () => {
    const score = computeScore(baseItem);
    expect(score).toBe(40);
  });

  describe('Title length rule', () => {
    it('should add 20 points when title length > 12', () => {
      const item: ICatalogItem = {
        ...baseItem,
        title: 'This is a long title that exceeds twelve characters'
      };
      const score = computeScore(item);
      expect(score).toBe(60); // 40 (base) + 20 (title)
    });

    it('should not add points when title length is exactly 12', () => {
      const item: ICatalogItem = {
        ...baseItem,
        title: 'Exactly 12!'
      };
      const score = computeScore(item);
      expect(score).toBe(40); // 40 (base) only
    });

    it('should not add points when title length < 12', () => {
      const item: ICatalogItem = {
        ...baseItem,
        title: 'Short'
      };
      const score = computeScore(item);
      expect(score).toBe(40); // 40 (base) only
    });
  });

  describe('Description length rule', () => {
    it('should add 15 points when description length > 60', () => {
      const item: ICatalogItem = {
        ...baseItem,
        description: 'This is a very long description that definitely exceeds sixty characters in total length for testing purposes'
      };
      const score = computeScore(item);
      expect(score).toBe(55); // 40 (base) + 15 (description)
    });

    it('should not add points when description length is exactly 60', () => {
      const item: ICatalogItem = {
        ...baseItem,
        description: 'This is exactly sixty characters long description text!'
      };
      const score = computeScore(item);
      expect(score).toBe(40); // 40 (base) only
    });

    it('should not add points when description length < 60', () => {
      const item: ICatalogItem = {
        ...baseItem,
        description: 'Short description'
      };
      const score = computeScore(item);
      expect(score).toBe(40); // 40 (base) only
    });
  });

  describe('Category rule', () => {
    it('should add 10 points when category is set and not empty', () => {
      const item: ICatalogItem = {
        ...baseItem,
        category: 'Electronics'
      };
      const score = computeScore(item);
      expect(score).toBe(50); // 40 (base) + 10 (category)
    });

    it('should not add points when category is empty string', () => {
      const item: ICatalogItem = {
        ...baseItem,
        category: ''
      };
      const score = computeScore(item);
      expect(score).toBe(40); // 40 (base) only
    });

    it('should not add points when category is only whitespace', () => {
      const item: ICatalogItem = {
        ...baseItem,
        category: '   '
      };
      const score = computeScore(item);
      expect(score).toBe(40); // 40 (base) only
    });
  });

  describe('Tags rules', () => {
    it('should add 10 points when item has exactly 1 tag', () => {
      const item: ICatalogItem = {
        ...baseItem,
        tags: ['tag1']
      };
      const score = computeScore(item);
      expect(score).toBe(50); // 40 (base) + 10 (1 tag)
    });

    it('should add 15 points when item has exactly 2 tags', () => {
      const item: ICatalogItem = {
        ...baseItem,
        tags: ['tag1', 'tag2']
      };
      const score = computeScore(item);
      expect(score).toBe(55); // 40 (base) + 10 (1 tag) + 5 (2 tags)
    });

    it('should add 15 points when item has more than 2 tags', () => {
      const item: ICatalogItem = {
        ...baseItem,
        tags: ['tag1', 'tag2', 'tag3', 'tag4']
      };
      const score = computeScore(item);
      expect(score).toBe(55); // 40 (base) + 10 (1 tag) + 5 (2 tags)
    });

    it('should not add points when item has no tags', () => {
      const item: ICatalogItem = {
        ...baseItem,
        tags: []
      };
      const score = computeScore(item);
      expect(score).toBe(40); // 40 (base) only
    });
  });

  describe('Combined rules', () => {
    it('should calculate score correctly with all rules applied', () => {
      const item: ICatalogItem = {
        ...baseItem,
        title: 'This is a long title that exceeds twelve characters',
        description: 'This is a very long description that definitely exceeds sixty characters in total length for testing purposes',
        category: 'Electronics',
        tags: ['tag1', 'tag2']
      };
      const score = computeScore(item);
      // 40 (base) + 20 (title) + 15 (description) + 10 (category) + 10 (1 tag) + 5 (2 tags) = 100
      expect(score).toBe(100);
    });

    it('should calculate score correctly with multiple rules', () => {
      const item: ICatalogItem = {
        ...baseItem,
        title: 'Long title here',
        description: 'Short desc',
        category: 'Furniture',
        tags: ['wood']
      };
      const score = computeScore(item);
      // 40 (base) + 20 (title) + 10 (category) + 10 (1 tag) = 80
      expect(score).toBe(80);
    });

    it('should cap score at 100 even if rules would exceed it', () => {
      const item: ICatalogItem = {
        ...baseItem,
        title: 'This is a long title that exceeds twelve characters',
        description: 'This is a very long description that definitely exceeds sixty characters in total length for testing purposes',
        category: 'Electronics',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
      };
      const score = computeScore(item);
      // Even with more tags, should cap at 100
      expect(score).toBe(100);
    });
  });

  describe('Edge cases', () => {
    it('should handle item with all fields empty', () => {
      const item: ICatalogItem = {
        id: '1',
        title: '',
        description: '',
        category: '',
        tags: [],
        creator: 'test@example.com',
        createdAt: '2025-01-10T10:00:00.000Z',
        approved: false
      };
      const score = computeScore(item);
      expect(score).toBe(40); // Base score only
    });

    it('should handle item with only category set', () => {
      const item: ICatalogItem = {
        ...baseItem,
        category: 'Test Category'
      };
      const score = computeScore(item);
      expect(score).toBe(50); // 40 (base) + 10 (category)
    });

    it('should handle item with only tags', () => {
      const item: ICatalogItem = {
        ...baseItem,
        tags: ['tag1', 'tag2']
      };
      const score = computeScore(item);
      expect(score).toBe(55); // 40 (base) + 10 (1 tag) + 5 (2 tags)
    });

    it('should handle item with long title and description but no category or tags', () => {
      const item: ICatalogItem = {
        ...baseItem,
        title: 'This is a long title that exceeds twelve characters',
        description: 'This is a very long description that definitely exceeds sixty characters in total length for testing purposes'
      };
      const score = computeScore(item);
      expect(score).toBe(75); // 40 (base) + 20 (title) + 15 (description)
    });
  });
});

