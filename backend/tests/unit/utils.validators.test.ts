import { emailSchema, paginationSchema, passwordSchema } from '../../src/utils/validators';

describe('validators', () => {
  it('accepts valid credentials and rejects malformed values', () => {
    expect(emailSchema.parse('user@example.test')).toBe('user@example.test');
    expect(() => emailSchema.parse('not-an-email')).toThrow();
    expect(passwordSchema.parse('password123')).toBe('password123');
    expect(() => passwordSchema.parse('short')).toThrow();
  });

  it('applies pagination defaults and safe limits', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(paginationSchema.parse({ page: '2', limit: '50' })).toEqual({ page: 2, limit: 50 });
    expect(() => paginationSchema.parse({ page: 0 })).toThrow();
    expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
  });
});
