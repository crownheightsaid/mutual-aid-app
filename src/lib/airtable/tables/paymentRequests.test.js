const mockDestroyFn = jest.fn();

jest.mock("~airtable/bases", () => ({
  paymentsAirbase: () => ({
    destroy: mockDestroyFn
  })
}));

const { Record } = require("airtable");
const {
  deletePaymentRequest,
  paymentRequestsTableName
} = require("./paymentRequests");

describe("deletePaymentRequest", () => {
  let paymentRequestRecord;

  beforeEach(() => {
    paymentRequestRecord = new Record(paymentRequestsTableName, "some-id");
  });

  test("sends a delete request to the Payment Request table", async () => {
    await deletePaymentRequest(paymentRequestRecord);

    expect(mockDestroyFn).toHaveBeenCalledWith(paymentRequestRecord.id);
  });
});
