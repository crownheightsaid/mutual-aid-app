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
  describe("when the email is not found", () => {
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
});
