import { token as makeToken } from "../../test/utils/factories/token";
import { majorAmountToMinor, minorAmountToMajor } from "./amount";

const token = makeToken();

describe("amount", () => {
  describe("majorAmountToMinor", () => {
    it("should convert integers", () =>
      expect(majorAmountToMinor(10, token)).toEqual(1000));
    it("should convert floats", () =>
      expect(majorAmountToMinor(10.45, token)).toEqual(1045));
    it("should round correctly", () =>
      expect(majorAmountToMinor(10.455, token)).toEqual(1046));
  });

  describe("minorAmountToMajor", () => {
    it("should convert integers", () =>
      expect(minorAmountToMajor(100, token)).toEqual("1.00"));
    it("should convert to floats", () =>
      expect(minorAmountToMajor(10455, token)).toEqual("104.55"));
  });
});
