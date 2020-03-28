const assert = require("assert");
const { saveRequest } = require("./airtable.js");

describe("Airtable Requests", () => {
  describe("saveRequest()", () => {
    it("should persist a request", async () => {
      const testEmail = "test@example.com";
      const testMessage = "test message body";
      const record = await saveRequest(testEmail, testMessage);
      assert.ok(record);
      assert.ok(record.getId());
      assert.ok(record.get("Email Address") === testEmail);
      assert.ok(record.get("Message") === testMessage);
    });
  });
});
