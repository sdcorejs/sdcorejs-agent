import { describe, expect, expectTypeOf, it } from 'vitest';
import { isFiniteNumericString, isNumericString, NumberUtilities } from '../index';
import { isFiniteNumericString as fromFunctions } from './index';

describe('public finite numeric string contract', () => {
  it('requires a string and a finite numeric result across public entries', () => {
    for (const isFiniteText of [isFiniteNumericString, fromFunctions, NumberUtilities.isFiniteNumericString]) {
      for (const value of ['0', '-1.25', '1e3']) expect(isFiniteText(value)).toBe(true);
      for (const value of [null, undefined, true, 42, NaN, {}, [], '', '1e999', 'Infinity']) {
        expect(isFiniteText(value)).toBe(false);
      }
    }
    expect(isNumericString('1e999')).toBe(true);
  });
  it('delegates each lexical option and narrows unknown', () => {
    expect(isFiniteNumericString(' 12 ', {trim:true})).toBe(true);
    expect(isFiniteNumericString(' 12 ', {trim:false})).toBe(false);
    expect(isFiniteNumericString('1e2', {allowExponent:false})).toBe(false);
    expect(isFiniteNumericString('+12', {allowLeadingPlus:false})).toBe(false);
    expect(isFiniteNumericString('0xff', {allowHex:true})).toBe(true);
    expect(isFiniteNumericString('0xff')).toBe(false);
    expect(isFiniteNumericString('0x' + 'f'.repeat(300), {allowHex:true})).toBe(false);
    expect(isFiniteNumericString('.5', {allowDecimal:false})).toBe(false);
    const narrow = (input: unknown) => {
      if (isFiniteNumericString(input)) expectTypeOf(input).toEqualTypeOf<string>();
    };
    narrow('12');
  });
});
