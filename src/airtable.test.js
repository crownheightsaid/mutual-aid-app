const assert = require("assert");
const { Changes, airbase } = require("./airtable.js");

describe("Airtable Changes", () => {
  describe("#poll()", () => {
    it("Should return models that are new", async () => {
      const changes = new Changes("PollingTest");
      let changed = await changes.poll();
      assert.equal(0, changed.length);
      const created = await airbase("PollingTest").create({ Name: "test" });
      changed = await changes.poll();
      assert.equal(1, changed.length);
      const updated = await airbase("PollingTest").update([
        {
          id: created.getId(),
          fields: { Name: "New Name" }
        }
      ]);
      assert.ok(updated);
      changed = await changes.poll();
      assert.equal(1, changed.length);
      const record = changed[0];
      assert.equal("New Name", record.get("Name"));
      const meta = {
        lastValues: {
          Name: "test",
          "Last Modified": created.get("Last Modified")
        }
      };
      assert.equal(`${JSON.stringify(meta)}\n`, record.get("Meta"));
    });
  });
});
