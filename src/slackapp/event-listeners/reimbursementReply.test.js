const { filterAndReply } = require('./reimbursementReply');
jest.mock("~slack/webApi", () => ({
  chat: {
    postMessage: jest.fn()
  }
}));

const { chat: { postMessage } } = require("~slack/webApi");
jest.mock("~airtable/tables/paymentRequests", () => ({
  findPaymentRequestBySlackThreadId: jest.fn()
}));
const { findPaymentRequestBySlackThreadId } = require("~airtable/tables/paymentRequests");
const { paymentRequestsTableName, paymentRequestsFields } = require("~airtable/tables/paymentRequestsSchema");

const { Record } = require("airtable");

jest.mock("~airtable/tables/donorPayments", () => ({
  createDonorPayment: jest.fn()
}));
const { createDonorPayment } = require("~airtable/tables/donorPayments");

jest.mock("~slack/channels", () => ({
  findChannelByName: jest.fn()
}));
const { findChannelByName } = require("~slack/channels");


describe('reimbursement reply', () => {
  let reimbursementChannelId, event;

  beforeEach(() => {
    reimbursementChannelId = 'the-reimbursement-channel-id';

    findChannelByName.mockResolvedValue({id: reimbursementChannelId});
  });

  afterEach(() => {
    postMessage.mockClear();
  });

  describe('when the balance is an even dollar amount', () => {
    beforeEach(() => {
      event = {
        bot_id: null,
        channel: reimbursementChannelId,
        parent_user_id: 'something',
        text: 'sending 5'
      };
    });

    describe('when there is a remaining balance', () => {
      beforeEach(() => {
        const paymentRequest = new Record(paymentRequestsTableName, 'payment-request-1', {
          fields: {
            [paymentRequestsFields.balance]: '6'
          }
        });

        findPaymentRequestBySlackThreadId.mockResolvedValue([paymentRequest]);
        createDonorPayment.mockResolvedValue([{}]);
      });

      test('it says how much is left', async () => {
        await filterAndReply(event);

        expect(postMessage).toHaveBeenCalled();
        expect(postMessage.mock.calls[0][0].text).toContain("just 1.00 to go");
      });
    });

    describe('when the balance is zeroed out', () => {
      beforeEach(() => {
        const paymentRequest = new Record(paymentRequestsTableName, 'payment-request-2', {
          fields: {
            [paymentRequestsFields.balance]: '5'
          }
        });

        findPaymentRequestBySlackThreadId.mockResolvedValue([paymentRequest]);
        createDonorPayment.mockResolvedValue([{}]);
      });

      test('it marks the request complete', async () => {
        await filterAndReply(event);

        expect(postMessage).toHaveBeenCalled();
        expect(postMessage.mock.calls[0][0].text).toContain("reimbursement is complete");
      });
    });
  });

  describe('when the balance has cents', () => {
    beforeEach(() => {
      event = {
        bot_id: null,
        channel: reimbursementChannelId,
        parent_user_id: 'something',
        text: 'sent $27.15'
      };
    });

    describe('when there is a remaining balance', () => {
      beforeEach(() => {
        const paymentRequest = new Record(paymentRequestsTableName, 'payment-request-1', {
          fields: {
            [paymentRequestsFields.balance]: '28.16'
          }
        });

        findPaymentRequestBySlackThreadId.mockResolvedValue([paymentRequest]);
        createDonorPayment.mockResolvedValue([{}]);
      });

      test('it says how much is left', async () => {
        await filterAndReply(event);

        expect(postMessage).toHaveBeenCalled();
        expect(postMessage.mock.calls[0][0].text).toContain("just 1.01 to go");
      });
    });

    describe('when the balance is zeroed out', () => {
      beforeEach(() => {
        const paymentRequest = new Record(paymentRequestsTableName, 'payment-request-2', {
          fields: {
            [paymentRequestsFields.balance]: '27.15'
          }
        });

        findPaymentRequestBySlackThreadId.mockResolvedValue([paymentRequest]);
        createDonorPayment.mockResolvedValue([{}]);
      });

      test('it marks the request complete', async () => {
        await filterAndReply(event);

        expect(postMessage).toHaveBeenCalled();
        expect(postMessage.mock.calls[0][0].text).toContain("reimbursement is complete");
      });
    });
  });
});
