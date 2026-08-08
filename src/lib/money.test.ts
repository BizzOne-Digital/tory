import { describe, expect, it } from "vitest";
import {
  applyPercentDiscount,
  calcLineTotal,
  formatMoney,
  fromMinor,
  sumMoney,
  toMinor,
} from "./money";

describe("toMinor / fromMinor", () => {
  it("converts major to minor units", () => {
    expect(toMinor(10)).toBe(1000);
    expect(toMinor(19.99)).toBe(1999);
    expect(toMinor(0)).toBe(0);
  });

  it("converts minor to major units", () => {
    expect(fromMinor(1000)).toBe(10);
    expect(fromMinor(1999)).toBe(19.99);
  });
});

describe("formatMoney", () => {
  it("formats USD amounts", () => {
    expect(formatMoney(1999)).toBe("$19.99");
    expect(formatMoney(0)).toBe("$0.00");
  });
});

describe("calcLineTotal", () => {
  it("multiplies unit price by quantity", () => {
    expect(calcLineTotal(2500, 3)).toBe(7500);
  });

  it("rejects invalid unit price", () => {
    expect(() => calcLineTotal(10.5, 2)).toThrow("Invalid unit price");
    expect(() => calcLineTotal(-100, 1)).toThrow("Invalid unit price");
  });

  it("rejects invalid quantity", () => {
    expect(() => calcLineTotal(100, 0)).toThrow("Invalid quantity");
    expect(() => calcLineTotal(100, 1.5)).toThrow("Invalid quantity");
  });
});

describe("sumMoney", () => {
  it("sums integer minor amounts", () => {
    expect(sumMoney([100, 200, 300])).toBe(600);
    expect(sumMoney([])).toBe(0);
  });

  it("rejects non-integer amounts", () => {
    expect(() => sumMoney([100, 50.5])).toThrow("Invalid money amount");
  });
});

describe("applyPercentDiscount", () => {
  it("applies percentage discount", () => {
    const result = applyPercentDiscount(10000, 15);
    expect(result.discountMinor).toBe(1500);
    expect(result.totalMinor).toBe(8500);
  });

  it("clamps percent to 0–100", () => {
    expect(applyPercentDiscount(1000, -10).discountMinor).toBe(0);
    expect(applyPercentDiscount(1000, 150).totalMinor).toBe(0);
  });
});
