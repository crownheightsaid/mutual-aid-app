const { getDaysSinceIsoTimestamp } = require("./time");

describe("helpers/time.js", () => {
  describe("getDaysSinceIsoTimestamp", () => {
    test("should return -1 for invalid input", () => {
      expect(getDaysSinceIsoTimestamp(undefined)).toStrictEqual(-1);
      expect(getDaysSinceIsoTimestamp(null)).toStrictEqual(-1);
      expect(getDaysSinceIsoTimestamp(false)).toStrictEqual(-1);
      expect(getDaysSinceIsoTimestamp(0)).toStrictEqual(-1);
      expect(getDaysSinceIsoTimestamp(12345)).toStrictEqual(-1);
    });

    test("should return 0 for the same day", () => {
      const actual = getDaysSinceIsoTimestamp(new Date().toISOString());
      expect(actual).toStrictEqual(0);
    });

    test("should return a positive integer for valid input older than today", () => {
      const actual = getDaysSinceIsoTimestamp("2020-04-20");
      expect(actual).toBeGreaterThan(0);
    });
  });
});
