const mockCreate = jest.fn();
const mockSelect = jest.fn();

jest.mock("~airtable/bases", () => ({
  paymentsAirbase: () => {
    return {
      create: mockCreate,
      select: mockSelect,
    };
  },
}));

const {
  createDonorPayment,
  findDonorPaymentByCode,
} = require("../donorPayments");
const { donorPaymentsFields } = require("../donorPaymentsSchema");

const { paymentsAirbase } = require("~airtable/bases");

describe("createDonorPayment", () => {
  const params = {
    [donorPaymentsFields.amount]: "some test amount",
    [donorPaymentsFields.status]: "some test status",
  };

  describe("on a successful Airtable call", () => {
    beforeEach(() => {
      mockCreate.mockResolvedValue("value");
    });

    test("it creates a donor payment record with the given fields", async () => {
      const result = await createDonorPayment(params);

      expect(paymentsAirbase().create).toHaveBeenCalledWith([
        { fields: params },
      ]);
      expect(result).toEqual(["value", null]);
    });
  });

  describe("on an unsuccessful Airtable call", () => {
    beforeEach(() => {
      mockCreate.mockRejectedValue("error");
    });

    test("it returns an error message", async () => {
      const result = await createDonorPayment(params);

      expect(paymentsAirbase().create).toHaveBeenCalledWith([
        { fields: params },
      ]);
      expect(result).toEqual([null, "error"]);
    });
  });
});

describe("findDonorPaymentByCode", () => {
  describe("given a code for an existing donor payment record", () => {
    beforeEach(() => {
      mockSelect.mockReturnValue({ firstPage: () => ["some test record"] });
    });

    it("returns that donor payment record", async () => {
      const result = await findDonorPaymentByCode("some test code");

      expect(mockSelect).toHaveBeenCalledWith({
        filterByFormula: expect.stringContaining(
          `{${donorPaymentsFields.code}} = "some test code"`
        ),
      });
      expect(result).toEqual(["some test record", null]);
    });
  });

  describe("given a code that does not correspond to an existing donor payment record", () => {
    beforeEach(() => {
      mockSelect.mockReturnValue({ firstPage: () => undefined });
    });

    it("returns an error message", async () => {
      const result = await findDonorPaymentByCode("some test code");

      expect(mockSelect).toHaveBeenCalledWith({
        filterByFormula: expect.stringContaining(
          `{${donorPaymentsFields.code}} = "some test code"`
        ),
      });
      expect(result).toEqual([null, "Valid payment with that code not found"]);
    });
  });

  describe("when an error occurs", () => {
    let result;
    const error = { message: "an error" };

    beforeEach(async () => {
      mockSelect.mockReturnValue({
        firstPage: jest.fn().mockRejectedValue(error),
      });

      result = await findDonorPaymentByCode("abcd");
    });

    test("it returns the error message", () => {
      expect(result[0]).toBeNull();
      expect(result[1]).toEqual(error.message);
    });
  });
});
