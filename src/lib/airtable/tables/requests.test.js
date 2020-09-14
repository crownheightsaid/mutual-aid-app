const mockDestroyFn = jest.fn();
const mockCreateFn = jest.fn();
const mockSelectFn = jest.fn();

jest.mock("~airtable/bases", () => ({
  airbase: (_name) => ({
    destroy: mockDestroyFn,
    create: mockCreateFn,
    select: mockSelectFn,
  }),
}));

const {
  deleteRequest,
  createRequest,
  findRequestByExternalId,
} = require("./requests.js");
const { fields } = require("./requestsSchema.js");

describe("deleteRequest", () => {
  describe("given an existing ID", () => {
    test("it sends a delete request to Airtable", async () => {
      mockDestroyFn.mockResolvedValue([{ id: "some-arbitrary-id" }]);

      const id = "some-arbitrary-id";

      const result = await deleteRequest(id);

      expect(mockDestroyFn).toHaveBeenCalledWith([id]);

      expect(result[0].id).toEqual(id);
      expect(result[1]).toEqual(null);
    });
  });

  describe("given a nonexistent ID", () => {
    beforeEach(() => {
      mockDestroyFn.mockRejectedValue("an-error");
    });

    test("it returns an error", async () => {
      const id = "another-id";

      const result = await deleteRequest(id);

      expect(mockDestroyFn).toHaveBeenCalledWith([id]);

      expect(result[0]).toEqual(null);
      expect(result[1]).toEqual("an-error");
    });
  });
});

describe("createRequest", () => {
  describe("given the minimum required fields", () => {
    test("creates and returns a request with defaults", async () => {
      mockCreateFn.mockResolvedValue("the created record");

      const message = "some test message";
      const source = "some test source";

      const result = await createRequest({ message, source });

      expect(mockCreateFn).toHaveBeenCalledWith({
        [fields.message]: message,
        [fields.type]: source,
        [fields.phone]: "",
        [fields.externalId]: "",
        [fields.crossStreetFirst]: "",
        [fields.email]: "",
        [fields.timeSensitivity]: "",
        [fields.status]: fields.status_options.dispatchNeeded,
      });

      expect(result[0]).toEqual("the created record");
      expect(result[1]).toEqual(null);
    });
  });
});

describe("findRequestByExternalId", () => {
  test("it sends a query", async () => {
    const id = "test external ID";
    await findRequestByExternalId(id);

    expect(mockSelectFn).toHaveBeenCalledWith({
      filterByFormula: `({${fields.externalId}} = '${id}')`,
    });
  });

  describe("when the query returns a result", () => {
    const record = "test record";

    beforeEach(() => {
      mockSelectFn.mockReturnValue({ firstPage: () => [record] });
    });

    test("it returns that record and no error", async () => {
      const result = await findRequestByExternalId("some id");
      expect(result[0]).toEqual(record);
      expect(result[1]).toEqual(null);
    });
  });

  describe("when the query returns no results", () => {
    beforeEach(() => {
      mockSelectFn.mockReturnValue({ firstPage: () => undefined });
    });

    test("it returns an error message", async () => {
      const result = await findRequestByExternalId("some id");

      expect(result[0]).toEqual(null);
      expect(result[1]).toEqual("Request with that external ID not found");
    });
  });
});
