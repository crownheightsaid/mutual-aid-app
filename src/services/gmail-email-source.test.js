const assert = require("assert");
const {
  GmailEmailSource,
  getSimplifiedMessage
} = require("./gmail-email-source");

describe("Gmail Email Source", function() {
  describe("#poll()", function() {
    it("should return emails", async function() {
      // TODO: think about integration tests? This requires a token set up in the environment
      // and an inbox that's labeled just-so
      const source = new GmailEmailSource("incoming");
      const results = await source.poll();
      assert.ok(results.length > 0);
    });
  });

  describe("getSimplifiedMessage", () => {
    it("should be able to parse gmail messages", () => {
      const rawMessage = {
        payload: {
          partId: "",
          mimeType: "multipart/alternative",
          filename: "",
          headers: [
            {
              name: "From",
              value: "Test User \u003ctest@example.com\u003e"
            },
            {
              name: "To",
              value: "chma"
            },
            {
              name: "Subject",
              value: "Email Subject"
            }
          ],
          body: {
            size: 0
          },
          parts: [
            {
              partId: "0",
              mimeType: "text/plain",
              body: {
                size: 30,
                data: "VGVzdCBtZXNzYWdlCkhlcmUgaXMgYSBuZXdsaW5l"
              }
            },
            {
              partId: "1",
              mimeType: "text/html",
              body: {
                size: 30,
                data:
                  "PHA+VGVzdCBtZXNzYWdlPC9wPgo8cD5IZXJlIGlzIGEgbmV3bGluZTwvcD4="
              }
            }
          ]
        },
        sizeEstimate: 81731
      };
      const message = getSimplifiedMessage(rawMessage);
      assert.ok(message.from === "Test User <test@example.com>");
      assert.ok(message.subject === "Email Subject");
      assert.ok(message.body === "Test message\nHere is a newline");
    });
  });
});
