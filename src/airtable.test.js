const assert = require("assert");
const { saveRequest, Request } = require("./airtable.js");

describe("Airtable Requests", function() {
  describe("saveRequest()", function() {
    it("should persist a request", async function() {
      const r = new Request({
        email: "test@examaple.com",
        message: "test message body"
      });
      const record = await saveRequest(r);
      assert.ok(record);
      assert.ok(record.getId());
      assert.ok(record["Email address"] === "test@example.com");
    });
  });
});
