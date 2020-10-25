const mockSelectFn = jest.fn();

jest.mock("~airtable/bases", () => ({
  airbase: () => ({
    select: mockSelectFn,
  }),
}));

const {
  findVolunteerByEmail
} = require("../volunteers.js");

describe("findVolunteerByEmail", () => {
  describe("when the email is NOT found", () => {
    const email = "notreal@example.com";
    let result;
    
    beforeEach(async () => {
      
      mockSelectFn.mockReturnValue({firstPage: () => []});
      
      result = await findVolunteerByEmail(email);
    });

    test("it returns an error message", () => {
      expect(result[0]).toBeNull();
      expect(result[1]).toEqual(expect.stringContaining(`No volunteer signed up with email ${email}`));
    });
  });

  describe("when the email IS found", () => {
    let result;

    beforeEach(async () => {
      mockSelectFn.mockReturnValue({firstPage: () => ["a volunteer"]});

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
      mockSelectFn.mockReturnValue({firstPage: jest.fn().mockRejectedValue(errorMessage)});

      result = await findVolunteerByEmail(email);
    });

    test("it returns the error message", () => {
      expect(result[0]).toBeNull();
      expect(result[1]).toEqual(`Errors looking up volunteer by email ${email}: ${errorMessage}`);
    });
  });
});
