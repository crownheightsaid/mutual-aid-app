const assert = require("assert");
const { airbase } = require("../../airtable");
const ChangeDetector = require("./ChangeDetector");

describe("Airtable Changes", () => {
  describe("#poll()", () => {
    it("Should return records that are new", async () => {
      const changes = new ChangeDetector("PollingTest");
      let changed = await changes.poll();
      assert.equal(0, changed.length);

      const created = await airbase("PollingTest").create({ Name: "test" });
      changed = await changes.poll();
      assert.equal(1, changed.length);
      const newRecord = changed[0];
      assert.equal("test", newRecord.get("Name"));
      assert.equal(undefined, newRecord.get("Notes"));
      assert.ok(newRecord.didChange("Name"));
      assert.ok(newRecord.didChange("Notes"));
      assert.equal(undefined, newRecord.getPrior("Name"));
      assert.equal(undefined, newRecord.getPrior("Notes"));

      const updated = await airbase("PollingTest").update([
        {
          id: created.getId(),
          fields: { Name: "New Name" }
        }
      ]);
      assert.ok(updated);
      changed = await changes.poll();
      assert.equal(1, changed.length);
      const updatedRecord = changed[0];
      assert.equal("New Name", updatedRecord.get("Name"));
      assert.equal(undefined, updatedRecord.get("Notes"));
      assert.ok(updatedRecord.didChange("Name"));
      assert.equal("test", updatedRecord.getPrior("Name"));
      assert.equal(false, updatedRecord.didChange("Notes"));
      const meta = {
        lastValues: {
          Name: "test",
          "Last Modified": created.get("Last Modified")
        }
      };
      assert.equal(`${JSON.stringify(meta)}\n`, updatedRecord.get("Meta"));

      changed = await changes.poll();
      assert.equal(0, changed.length);
    });
  }).timeout(10000);
});
