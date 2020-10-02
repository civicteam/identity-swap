// Taken from https://observablehq.com/@mbostock/localized-number-parsing#NumberParser

export class IntlNumberParser {
  private group: RegExp;
  private decimal: RegExp;
  private numeral: RegExp;
  private index: (d: string) => string;

  constructor(locale: string) {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const numerals = new Intl.NumberFormat(locale, { useGrouping: false })
      .format(9876543210)
      .split("")
      .reverse();
    const index = new Map(numerals.map((d, i) => [d, i]));
    this.group = new RegExp(
      `[${parts.find((d) => d.type === "group")?.value}]`,
      "g"
    );
    this.decimal = new RegExp(
      `[${parts.find((d) => d.type === "decimal")?.value}]`
    );
    this.numeral = new RegExp(`[${numerals.join("")}]`, "g");
    this.index = (d) => "" + index.get(d);
  }

  parse(numberString: string): number {
    const parsedString = numberString
      .trim()
      .replace(this.group, "")
      .replace(this.decimal, ".")
      .replace(this.numeral, this.index);
    return parsedString ? +parsedString : NaN;
  }
}
