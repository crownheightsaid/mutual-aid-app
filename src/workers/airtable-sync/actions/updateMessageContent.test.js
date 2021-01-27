jest.mock("~slack/channels", () => ({ getExistingMessage: jest.fn() }));
jest.mock("~slack/webApi", () => ({ chat: { update: jest.fn() } }));

require("~strings/i18nextInit");
const { Record } = require("airtable");
const {
  chat: { update: updateFn },
} = require("~slack/webApi");
const { getExistingMessage: getExistingMessageFn } = require("~slack/channels");
const updateMessageContent = require("./updateMessageContent");
const requests = require("~airtable/tables/requestsSchema");

describe('When request has been posted with status "Delivery Needed"', () => {
  let requestRecord;

  describe("and the record does not have cross streets", () => {
    beforeEach(() => {
      getExistingMessageFn.mockResolvedValue({
        text: `*Household Size*: n/a
*Cross Streets*: <https://crownheightsma.herokuapp.com/delivery-needed?request=RN7SQ3|>
*Description*: No notes`,
      });

      requestRecord = new Record(requests.tableName, "id-1", {
        [requests.fields.status]: requests.fields.status_options.deliveryNeeded,
        [requests.fields.crossStreetFirst]: null,
        [requests.fields.crossStreetSecond]: null,
      });

      // this function is added by airtable-change-detector
      requestRecord.getMeta = () => ({
        slack_ts: "some-slack-ts",
        slack_channel: "some-slack-channel",
      });
    });

    describe('and the status is changed to "Delivery Assigned"', () => {
      beforeEach(() => {
        updateFn.mockClear();

        requestRecord.set(
          requests.fields.status,
          requests.fields.status_options.deliveryAssigned
        );
      });

      test("the cross streets line is removed from the post", async () => {
        await updateMessageContent(requestRecord);

        expect(updateFn.mock.calls[0][0].text).not.toMatch(/\*Cross Streets\*/);
      });
    });
  });

  describe("and the request has cross streets", () => {
    beforeEach(() => {
      getExistingMessageFn.mockResolvedValue({
        text: `*Household Size*: n/a
*Cross Streets*: <https://crownheightsma.herokuapp.com/delivery-needed?request=RN7SQ3|St Johns Pl &amp; Nostrand Ave>
*Description*: No notes`,
      });

      requestRecord = new Record(requests.tableName, "id-1", {
        [requests.fields.status]: requests.fields.status_options.deliveryNeeded,
        [requests.fields.crossStreetFirst]: "St Johns Pl",
        [requests.fields.crossStreetSecond]: "Nostrand Ave",
      });

      // this function is added by airtable-change-detector
      requestRecord.getMeta = () => ({
        slack_ts: "some-slack-ts",
        slack_channel: "some-slack-channel",
      });
    });

    describe('and the status is changed to "Delivery Assigned"', () => {
      beforeEach(() => {
        updateFn.mockClear();

        requestRecord.set(
          requests.fields.status,
          requests.fields.status_options.deliveryAssigned
        );
      });

      test("the delivery map link is removed from the post", async () => {
        await updateMessageContent(requestRecord);

        updateFn.mock.calls[0][0].text.split("\n").forEach((line) => {
          if (line.startsWith(`*Cross Streets*`)) {
            expect(line).not.toMatch(/<http.*>/);
          }
        });

        expect.assertions(1);
      });
    });
  });
});
