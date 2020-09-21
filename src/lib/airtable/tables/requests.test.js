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

const { Record } = require("airtable");
const {
  deleteRequest,
  createRequest,
  findRequestByExternalId,
  findDeliveryNeededRequests,
  findOpenRequestsForSlack,
  findRequestByCode,
} = require("./requests.js");
const { fields, tableName } = require("./requestsSchema.js");

const buildRequestRecord = ({
  id,
  postedInSlack = false,
  drivingCluster = false,
}) => {
  const record = new Record(tableName, id);

  if (postedInSlack) {
    record.set(fields.meta, JSON.stringify({ slack_ts: "some-slack-ts" }));
  }

  record.set(fields.forDrivingClusters, drivingCluster);

  return record;
};

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
    const record = buildRequestRecord({ id: "xyz", postedInSlack: false });

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
    let result;
    let record;

    beforeAll(async () => {
      record = buildRequestRecord({ id: "abc", postedInSlack: true });

      mockSelectFn.mockReturnValue({ all: () => [record] });

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
    let result;
    let record;

    beforeAll(async () => {
      record = buildRequestRecord({ id: 1, postedInSlack: true });
      const notInSlackRecord = buildRequestRecord({
        id: 2,
        postedInSlack: false,
      });

      mockSelectFn.mockReturnValue({ all: () => [record, notInSlackRecord] });

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

describe("findOpenRequestsForSlack", () => {
  describe("when there are requests not posted in Slack", () => {
    let result;
    let inSlackRecord;
    let notInSlackRecord;

    beforeAll(async () => {
      inSlackRecord = buildRequestRecord({ id: 1, postedInSlack: true });
      notInSlackRecord = buildRequestRecord({ id: 2, postedInSlack: false });

      mockSelectFn.mockReturnValue({
        all: () => [inSlackRecord, notInSlackRecord],
      });

      result = await findOpenRequestsForSlack();
    });

    afterAll(() => {
      mockSelectFn.mockClear();
    });

    test("it only returns records NOT posted in Slack", () => {
      expect(result[0]).toHaveLength(1);
      expect(result[0]).toEqual([notInSlackRecord]);
      expect(result[1]).toEqual(null);
    });
  });

  describe("when there are requests for driving clusters", () => {
    let result;
    let regularRecord;
    let drivingClusterRecord;

    beforeAll(async () => {
      regularRecord = buildRequestRecord({ id: 8, drivingCluster: false });
      drivingClusterRecord = buildRequestRecord({
        id: 12,
        drivingCluster: true,
      });

      mockSelectFn.mockReturnValue({
        all: () => [regularRecord, drivingClusterRecord],
      });

      result = await findOpenRequestsForSlack();
    });

    test("it filters out driving cluster requests", () => {
      expect(result[0]).toHaveLength(1);
      expect(result[0]).toEqual([regularRecord]);
      expect(result[1]).toEqual(null);
    });
  });
});

describe("findRequestByCode", () => {
  describe("given a code of less than 4 characters", () => {
    let result;

    beforeAll(async () => {
      result = await findRequestByCode("123");
    });

    test("it returns an error", () => {
      expect(result[0]).toEqual(null);
      expect(result[1]).toEqual("Request code must be at least 4 characters.");
    });
  });

  describe("given a valid code", () => {
    beforeAll(async () => {
      await findRequestByCode("1234");
    });

    test("it sends a select request", () => {
      expect(mockSelectFn).toHaveBeenCalledWith({
        filterByFormula: `(FIND('1234', {${fields.code}}) > 0)`,
      });
    });

    describe("when the code does not exist", () => {
      let result;

      beforeAll(async () => {
        mockSelectFn.mockReturnValue({
          firstPage: () => [],
        });

        result = await findRequestByCode("4567");
      });

      test("it returns an error message", () => {
        expect(result[0]).toEqual(null);
        expect(result[1]).toEqual("No requests found with that code.");
      });
    });

    describe("when the code exists", () => {
      let result;

      beforeAll(async () => {
        mockSelectFn.mockReturnValue({
          firstPage: () => ["something"],
        });

        result = await findRequestByCode("7890");
      });

      test("it returns the record", () => {
        expect(result[0]).toEqual("something");
        expect(result[1]).toEqual(null);
      });
    });
  });
});
