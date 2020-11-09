const mockSelectFn = jest.fn();
const mockFindFn = jest.fn();

jest.mock("~airtable/bases", () => ({
  airbase: () => ({
    select: mockSelectFn,
    find: mockFindFn,
  }),
}));

const {
  findVolunteerByEmail,
  findVolunteerById,
  findVolunteerByPhone,
} = require("../volunteers.js");

const { volunteersFields } = require("../volunteersSchema.js");

describe("findVolunteerByEmail", () => {
  describe("when the email is NOT found", () => {
    const email = "notreal@example.com";
    let result;

    beforeEach(async () => {
      mockSelectFn.mockReturnValue({ firstPage: () => [] });

      result = await findVolunteerByEmail(email);
    });

    test("it returns an error message", () => {
      expect(result[0]).toBeNull();
      expect(result[1]).toEqual(
        expect.stringContaining(`No volunteer signed up with email ${email}`)
      );
    });
  });

  describe("when the email IS found", () => {
    let result;

    beforeEach(async () => {
      mockSelectFn.mockReturnValue({ firstPage: () => ["a volunteer"] });

      result = await findVolunteerByEmail("real@example.com");
    });

    test("it returns the volunteer record", () => {
      expect(result[0]).toEqual("a volunteer");
      expect(result[1]).toBeNull();
    });
  });

  describe("when there is an error", () => {
    const email = "error@example.com";
    const errorMessage = "some error";
    let result;

    beforeEach(async () => {
      mockSelectFn.mockReturnValue({
        firstPage: jest.fn().mockRejectedValue(errorMessage),
      });

      result = await findVolunteerByEmail(email);
    });

    test("it returns the error message", () => {
      expect(result[0]).toBeNull();
      expect(result[1]).toEqual(
        `Errors looking up volunteer by email ${email}: ${errorMessage}`
      );
    });
  });

  describe("findVolunteerById", () => {
    const id = 1234;

    beforeEach(async () => {
      await findVolunteerById(id);
    });

    test("it sends a find request", () => {
      expect(mockFindFn).toHaveBeenCalledWith(id);
    });

    describe("if the ID exists", () => {
      const volunteer = "a volunteer";
      let result;

      beforeEach(async () => {
        mockFindFn.mockResolvedValue(volunteer);

        result = await findVolunteerById(id);
      });

      test("it returns the volunteer", () => {
        expect(result[0]).toEqual(volunteer);
        expect(result[1]).toBeNull();
      });
    });

    describe("if the ID does not exist", () => {
      const error = "an error";
      let result;

      beforeEach(async () => {
        mockFindFn.mockRejectedValue(error);

        result = await findVolunteerById(id);
      });

      test("it returns the error message", () => {
        expect(result[0]).toBeNull();
        expect(result[1]).toEqual(
          `Errors looking up volunteer by recordId ${id}: ${error}`
        );
      });
    });
  });

  describe("findVolunteerByPhone", () => {
    describe("when the phone number IS found", () => {
      let result;
      const volunteer = "a volunteer";
      const phone = "123-555-4444";

      beforeEach(async () => {
        mockSelectFn.mockReturnValue({
          firstPage: () => [volunteer],
        });

        result = await findVolunteerByPhone(phone);
      });

      test("it returns the volunteer", () => {
        expect(result[0]).toEqual(volunteer);
        expect(result[1]).toBeNull();
      });

      test("it makes a select request by phone number", () => {
        expect(mockSelectFn).toHaveBeenCalledWith({
          maxRecords: 1,
          filterByFormula: `FIND("1235554444", ${volunteersFields.phone}) > 0`,
        });
      });
    });
    describe("when the phone number is NOT found", () => {
      let result;
      const phone = "123-555-4444";

      beforeEach(async () => {
        mockSelectFn.mockReturnValue({
          firstPage: () => [],
        });

        result = await findVolunteerByPhone(phone);
      });

      test("it returns a 404 message", () => {
        expect(result[0]).toBeNull();
        expect(result[1]).toEqual(
          `404: No volunteer signed up with phone number ${phone}.`
        );
      });
    });

    describe("when there is an error in the request", () => {
      let result;
      const error = "an error";
      const phone = "123-555-4444";

      beforeEach(async () => {
        mockSelectFn.mockReturnValue({
          firstPage: jest.fn().mockRejectedValue(error),
        });

        result = await findVolunteerByPhone(phone);
      });

      test("it returns the error message", () => {
        expect(result[0]).toBeNull();
        expect(result[1]).toEqual(
          `Errors looking up volunteer by phone number ${phone}: ${error}`
        );
      });
    });
  });
});
