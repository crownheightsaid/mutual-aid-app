const { getUrgencyStyles } = require("./map-urgency");

describe("Urgency styles", () => {
  test("it should return the styles for 'n/a' requests", () => {
    const daysOpen = -1;
    const styles = getUrgencyStyles(daysOpen);
    expect(styles).toStrictEqual({
      backgroundColor: "grey",
    });
  });

  test("it should return the styles for 'recent' requests", () => {
    const daysOpen = 1;
    const styles = getUrgencyStyles(daysOpen);
    expect(styles).toStrictEqual({
      backgroundColor: "green",
    });
  });

  test("it should return the styles for 'moderate' requests", () => {
    const daysOpen = 3;
    const styles = getUrgencyStyles(daysOpen);
    expect(styles).toStrictEqual({
      backgroundColor: "orange",
    });
  });

  test("it should return the styles for 'urgent' requests", () => {
    const daysOpen = 7;
    const styles = getUrgencyStyles(daysOpen);
    expect(styles).toStrictEqual({
      backgroundColor: "red",
    });
  });
});
