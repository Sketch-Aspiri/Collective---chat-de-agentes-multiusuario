import { describe, it, expect } from 'vitest';
import { parseMentions, splitByMentions } from '@/utils/mentions';

describe('parseMentions', () => {
  it('extrae los handles mencionados sin el @', () => {
    expect(parseMentions('Hola @planner y @researcher')).toEqual(['planner', 'researcher']);
  });

  it('elimina duplicados preservando el orden', () => {
    expect(parseMentions('@planner @planner @reviewer')).toEqual(['planner', 'reviewer']);
  });

  it('devuelve array vacío cuando no hay menciones', () => {
    expect(parseMentions('sin menciones aquí')).toEqual([]);
  });

  it('ignora el @ suelto sin handle', () => {
    expect(parseMentions('correo @ suelto')).toEqual([]);
  });
});

describe('splitByMentions', () => {
  it('divide el texto en segmentos de texto y mención', () => {
    const segments = splitByMentions('Hola @planner!');
    expect(segments).toEqual([
      { text: 'Hola ', isMention: false },
      { text: '@planner', isMention: true },
      { text: '!', isMention: false },
    ]);
  });

  it('marca correctamente una mención al inicio', () => {
    const segments = splitByMentions('@reviewer revisa esto');
    expect(segments[0]).toEqual({ text: '@reviewer', isMention: true });
  });
});
