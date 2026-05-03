import { describe, it, expect } from 'bun:test';
import { Category } from '../../businesses/category-model';

describe('Category model', () => {
  it('should have the correct collection name', () => {
    expect(Category.modelName).toBe('Category');
  });
});