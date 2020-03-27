const assert = require('assert');
const GmailEmailSource = require('./gmail-email-source');
console.log(GmailEmailSource);

describe('Gmail Email Source', function() {
  describe('#poll()', function() {
    it('should return emails', async function() {
      const source = new GmailEmailSource('incoming');
      const results = await source.poll();
      assert.ok(results.length > 0);
    });
  });
});
