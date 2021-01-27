import React from "react";
import { render } from "@testing-library/react";
import DaysOpenChip from "./DaysOpenChip";

describe("DaysOpenChip", () => {
  let container;

  describe("when daysOpen is less than 0 (invalid)", () => {
    beforeEach(() => {
      container = render(<DaysOpenChip daysOpen={-1} />).container;
    });

    test('it has the "invalid" class', () => {
      expect(container.querySelector("div > div").className).toContain(
        "invalid"
      );
    });
  });

  describe("when daysOpen is less than 3", () => {
    beforeEach(() => {
      container = render(<DaysOpenChip daysOpen={1} />).container;
    });

    test('it is has the "recent" class', () => {
      expect(container.querySelector("div > div").className).toContain(
        "recent"
      );
    });
  });

  describe("when daysOpen is in the range [3, 5)", () => {
    beforeEach(() => {
      container = render(<DaysOpenChip daysOpen={4} />).container;
    });

    test('it has the "moderate" class', () => {
      expect(container.querySelector("div > div").className).toContain(
        "moderate"
      );
    });
  });

  describe("when daysOpen is 5 or more", () => {
    beforeEach(() => {
      container = render(<DaysOpenChip daysOpen={6} />).container;
    });

    test('it has the "urgent" class', () => {
      expect(container.querySelector("div > div").className).toContain(
        "urgent"
      );
    });
  });
});
