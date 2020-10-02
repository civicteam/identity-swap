import { IntlNumberParser } from "./IntlNumberParser";

describe("IntlNumberParser", () => {
  describe("with english locale 'en-US'", () => {
    const parser = new IntlNumberParser("en");

    it("should parse integers", () => expect(parser.parse("123")).toEqual(123));
    it("should ignore trailing decimal indicators", () =>
      expect(parser.parse("123.")).toEqual(123));
    it("should parse numbers with decimals", () =>
      expect(parser.parse("123.45")).toEqual(123.45));
    it("should parse large numbers without separators", () =>
      expect(parser.parse("12345678.90")).toEqual(12345678.9));
    it("should parse large numbers with separators", () =>
      expect(parser.parse("12,345,678.90")).toEqual(12345678.9));
  });

  describe("with german locale 'de'", () => {
    const parser = new IntlNumberParser("de");

    it("should parse integers", () => expect(parser.parse("123")).toEqual(123));
    it("should ignore trailing decimal indicators", () =>
      expect(parser.parse("123,")).toEqual(123));
    it("should parse numbers with decimals", () =>
      expect(parser.parse("123,45")).toEqual(123.45));
    it("should parse large numbers without separators", () =>
      expect(parser.parse("12345678,90")).toEqual(12345678.9));
    it("should parse large numbers with separators", () =>
      expect(parser.parse("12.345.678,90")).toEqual(12345678.9));
  });

  describe("with indianlocale 'en-IN'", () => {
    const parser = new IntlNumberParser("en-IN");

    it("should parse integers", () => expect(parser.parse("123")).toEqual(123));
    it("should ignore trailing decimal indicators", () =>
      expect(parser.parse("123,")).toEqual(123));
    it("should parse numbers with decimals", () =>
      expect(parser.parse("123.45")).toEqual(123.45));
    it("should parse large numbers without separators", () =>
      expect(parser.parse("12345678.90")).toEqual(12345678.9));
    it("should parse large numbers with separators", () =>
      expect(parser.parse("1,23,45,678.90")).toEqual(12345678.9));
  });

  describe("with arabic locale 'ar'", () => {
    const parser = new IntlNumberParser("ar");

    it("should parse integers", () => expect(parser.parse("123")).toEqual(123));
    it("should ignore trailing decimal indicators", () =>
      expect(parser.parse("123.")).toEqual(123));
    it("should parse numbers with decimals", () =>
      expect(parser.parse("123.45")).toEqual(123.45));
    it("should parse large numbers without separators", () =>
      expect(parser.parse("12345678.90")).toEqual(12345678.9));
    // arabic does not typically break up numbers with separators
    it("should not parse large numbers with separators", () =>
      expect(parser.parse("12,345,678.90")).toEqual(NaN));
  });
});
