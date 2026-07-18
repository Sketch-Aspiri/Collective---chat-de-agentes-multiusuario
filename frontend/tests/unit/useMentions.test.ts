import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMentions } from '@/hooks/useMentions';

describe('useMentions', () => {
  it('devuelve los handles mencionados en el texto', () => {
    const { result } = renderHook(() => useMentions('ping @planner y @reviewer'));
    expect(result.current).toEqual(['planner', 'reviewer']);
  });

  it('devuelve la misma referencia si el texto no cambia (memoización)', () => {
    const { result, rerender } = renderHook(({ text }) => useMentions(text), {
      initialProps: { text: '@planner' },
    });
    const first = result.current;
    rerender({ text: '@planner' });
    expect(result.current).toBe(first);
  });
});
