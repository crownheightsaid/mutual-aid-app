const mockDestroyFn = jest.fn();
const mockCreateFn = jest.fn();
const mockSelectFn = jest.fn();

jest.mock("~airtable/bases", () => ({
  airbase: () => ({
    destroy: mockDestroyFn,
    create: mockCreateFn,
    select: mockSelectFn,
  }),
}));

const {
  deleteRequest,
  createRequest,
  findRequestByExternalId,
  findDeliveryNeededRequests,
} = require("./requests.js");
const { fields, tableName } = require("./requestsSchema.js");

const { Record } = require("airtable");

const buildRequestRecord = ({id, postedInSlack}) => {
  const record = new Record(tableName, id);

  if (postedInSlack) {
    record.set(fields.meta, JSON.stringify({slack_ts: 'some-slack-ts'}));
  }

  return record;
}

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
  afterEach(() => {
    mockSelectFn.mockClear();
  });

  test("it sends a query", async () => {
    const id = "test external ID";
    await findRequestByExternalId(id);

    expect(mockSelectFn).toHaveBeenCalledWith({
      filterByFormula: `({${fields.externalId}} = '${id}')`,
    });
  });

  describe("when the query returns a result", () => {
    const record = buildRequestRecord({id: 'xyz', postedInSlack: false});

    beforeEach(() => {
      mockSelectFn.mockReturnValue({ firstPage: () => [record] });
    });

    afterEach(() => {
      mockSelectFn.mockClear();
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

    afterEach(() => {
      mockSelectFn.mockClear();
    });

    test("it returns an error message", async () => {
      const result = await findRequestByExternalId("some id");

      expect(result[0]).toEqual(null);
      expect(result[1]).toEqual("Request with that external ID not found");
    });
  });
});

describe("findDeliveryNeededRequests", () => {
  describe("when all requests have been posted in Slack", () => {
    let result, record;
    
    beforeAll(async () => {
      record = buildRequestRecord({id: 'abc', postedInSlack: true});
      
      mockSelectFn.mockReturnValue({all: () => [record]});
      
      result = await findDeliveryNeededRequests();
    });
    
    afterEach(() => {
      mockSelectFn.mockClear();
    });

    test("it sends a request with a query", () => {
      expect(mockSelectFn).toHaveBeenCalledWith({
	filterByFormula: `OR({${fields.status}} = '${fields.status_options.dispatchStarted}', {${fields.status}} = '${fields.status_options.deliveryNeeded}')`,
      });
    });


    test("it returns the results", () => {
      expect(result[0]).toEqual([record]);
      expect(result[1]).toEqual(null);
    });
  });

  describe("when there are requests not posted in Slack", () => {
    let result, record;
    
    beforeAll(async () => {
      record = buildRequestRecord({id: 1, postedInSlack: true});
      const notInSlackRecord = buildRequestRecord({id: 2, postedInSlack: false});

      mockSelectFn.mockReturnValue({all: () => [record, notInSlackRecord]});

      result = await findDeliveryNeededRequests();
    });

    afterAll(() => {
      mockSelectFn.mockClear();
    });

    test("it only returns records posted in Slack", () => {
      expect(result[0]).toHaveLength(1);
      expect(result[0]).toEqual([record]);
      expect(result[1]).toEqual(null);
    });
  });
});
