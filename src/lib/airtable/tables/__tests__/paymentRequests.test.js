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
    let code, update, result, record;
    
    beforeAll(async () => {
      code = "123";
      update = { [paymentRequestsFields.balance]: "100" };
      
      record = new Record(paymentRequestsTableName, "id-50", {
	[paymentRequestsFields.amount]: "150",
	[paymentRequestsFields.balance]: "150"
      });
      
      mockSelectFn.mockReturnValue({ firstPage: () => [record] });

      mockUpdateFn.mockReturnValue(["an updated record"]);
      
      result = await updatePaymentRequestByCode(code, update);
    });

    test("it sends a select request", () => {
      expect(mockSelectFn).toHaveBeenCalledWith({
	filterByFormula: `(FIND('${code}', {${paymentRequestsFields.requestCode}}) > 0)`
      });
    });

    test("it sends an update request with the new values", () => {
      expect(mockUpdateFn).toHaveBeenCalledWith([{
	id: record.id,
	fields: {
	  [paymentRequestsFields.balance]: "100"
	}
      }]);
    });
    
    test("it returns the payment request record", () => {
      expect(result[0]).toEqual("an updated record");
      expect(result[1]).toBeNull();
    });
  });

  describe("when no payment request exists for the given code", () => {
    let result;
    const code = "some code";
    
    beforeAll(async () => {
      mockSelectFn.mockReturnValue({ firstPage: () => [] });

      result = await updatePaymentRequestByCode(code, "some update");
    });

    test("it returns an error message", () => {
      expect(result[0]).toBeNull();
      expect(result[1]).toEqual(`No requests found with code: ${code}`);
    });
  });

  describe("when an error occurs in the select request", () => {
    let result;
    const error = "a select error message";

    beforeAll(async () => {
      mockSelectFn.mockReturnValue({
	firstPage: jest.fn().mockRejectedValue(error)
      });

      result = await updatePaymentRequestByCode("some code", "some update");
    });
    
    test("it returns the error message", () => {
      expect(result[0]).toBeNull();
      expect(result[1]).toEqual(`Error while processing update: ${error}`);
    });
  });

  describe("when an error occurs in the update request", () => {
    let result;
    const error = "an update error message";

    beforeAll(async () => {
      mockSelectFn.mockReturnValue({
	firstPage: () => [new Record(paymentRequestsTableName, "some-id")]
      });

      mockUpdateFn.mockRejectedValue(error);

      result = await updatePaymentRequestByCode("some code", "some update");
    });

    test("it returns the error message", () => {
      expect(result[0]).toBeNull();
      expect(result[1]).toEqual(`Error while processing update: ${error}`);
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
