const { Record } = require("airtable");
const { str } = require("~strings/i18nextWrappers");
const updateMessageContent = require("./updateMessageContent");
const requests = require("~airtable/tables/requests");

jest.mock("~slack/webApi", () => ({ chat: { update: jest.fn() } }));
const {
  chat: { update: updateFn }
} = require("~slack/webApi");

jest.mock("~slack/channels", () => ({
  getExistingMessage: jest.fn().mockResolvedValue({
    text: `:red_circle: Hey Crown Heights, we have a new request from our neighbor  at St Johns Pl &amp; Nostrand Ave in *NW Crown Heights*:
*Timeline*: When convenient
*Neighborhood*: NW Crown Heights
*Household Size*: n/a
*Cross Streets*: <https://crownheightsma.herokuapp.com/delivery-needed?request=RN7SQ3|St Johns Pl &amp; Nostrand Ave>
*Description*: No notes
*Code*: RN7SQ3
*Want to volunteer to help our neighbor?* Comment on this thread and <@U013U0V27HU> will follow up with more details.
_Reminder: Please don’t volunteer for delivery if you have any COVID-19/cold/flu-like symptoms, or have come into contact with someone that’s tested positive. If you have been in large crowds or demonstrations, please wait 5 days after a negative test result or 14 days of self-isolation without a test._
For more information, please see the <https://docs.google.com/document/d/1gLQsC3QUylavyzEYXWa7MVuk-H0DOnVtQtFm2fBXDQg/preview|delivery guide>.`
  })
}));

describe('When request has been posted with status "Delivery Needed"', () => {
  let requestRecord;

  beforeEach(() => {
    requestRecord = new Record(requests.tableName, "id-1", {
      [requests.fields.status]: requests.fields.status_options.deliveryNeeded
    });

    // this function is added by airtable-change-detector
    requestRecord.getMeta = () => ({
      slack_ts: "some-slack-ts",
      slack_channel: "some-slack-channel"
    });
  });

  describe('and the status is changed to "Delivery Assigned"', () => {
    beforeEach(() => {
      requestRecord.set(
        requests.fields.status,
        requests.fields.status_options.deliveryAssigned
      );
    });

    test("the delivery map link is removed from the post", async () => {
      try {
        await updateMessageContent(requestRecord);

        updateFn.mock.calls[0][0].text.split("\n").forEach(line => {
          if (
            line.startsWith(
              `*${str("slackapp:requestBotPost.post.fields.streets.name")}*`
            )
          ) {
            expect(line).not.toMatch(/<http.*>/);
          }
        });

        expect.hasAssertions();
      } catch (e) {
        fail(e);
      }
    });
  });
});
