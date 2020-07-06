const mockDestroyFn = jest.fn();

jest.mock("~airtable/bases", () => ({
  paymentsAirbase: () => ({
    destroy: mockDestroyFn
  })
}))

const { deletePaymentRequest, paymentRequestsTableName } = require('./paymentRequests');
const { Record } = require("airtable");

describe('deletePaymentRequest', () => {
  let paymentRequestRecord;

  beforeEach(() => {
    paymentRequestRecord = new Record(paymentRequestsTableName, 'some-id');
  })

  test('sends a delete request to the Payment Request table', async () => {
    await deletePaymentRequest(paymentRequestRecord);

    expect(mockDestroyFn).toHaveBeenCalledWith(paymentRequestRecord.id);
  });
});
