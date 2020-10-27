const mockSelectFn = jest.fn();
const mockUpdateFn = jest.fn();
const mockDestroyFn = jest.fn();

jest.mock("~airtable/bases", () => ({
  paymentsAirbase: () => ({
    select: mockSelectFn,
    update: mockUpdateFn,
    destroy: mockDestroyFn,
  }),
}));

const { Record } = require("airtable");
const {
  deletePaymentRequest,
  updatePaymentRequestByCode,
} = require("../paymentRequests");
const {
  paymentRequestsTableName,
  paymentRequestsFields,
} = require("../paymentRequestsSchema");

describe("updatePaymentRequestByCode", () => {
  describe("when a payment request exists for the given code", () => {
    let code, update, result;
    
    beforeAll(async () => {
      code = "123";
      update = { [paymentRequestsFields.balance]: "100" };

      mockSelectFn.mockReturnValue({
	firstPage: () => "a record"
      });

      mockUpdateFn.mockReturnValue(["an updated record"]);
      
      result = await updatePaymentRequestByCode(code, update);
    });
    
    test("it returns the payment request record", () => {
      expect(result[0]).toEqual("an updated record");
      expect(result[1]).toBeNull();
    });
  });
});

describe("deletePaymentRequest", () => {
  let paymentRequestRecord;

  beforeAll(async () => {
    paymentRequestRecord = new Record(paymentRequestsTableName, "some-id");
    await deletePaymentRequest(paymentRequestRecord);
  });

  test("it sends a delete request to the Payment Request table", () => {
    expect(mockDestroyFn).toHaveBeenCalledWith(paymentRequestRecord.id);
  });

  describe("when an error occurs", () => {
    const error = "an error";
    let consoleErrorFn;
    
    beforeAll(async () => {
      consoleErrorFn = console.error;
      console.error = jest.fn();
      mockDestroyFn.mockRejectedValue(error);
      await deletePaymentRequest(paymentRequestRecord);
    });

    afterAll(() => {
      console.error = consoleErrorFn;
    });

    test("it logs the error", () => {
      expect(console.error).toHaveBeenCalledWith(`Error while deleting payment request ${error}`);
    });
  });
});
