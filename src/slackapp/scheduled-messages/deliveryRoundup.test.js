process.env.I18N_NEXT_QUIET = 1;
require("~strings/i18nextInit");

const Record = require("airtable/lib/record");
const requests = require("~airtable/tables/requests");
const deliveryRoundup = require("./deliveryRoundup");

jest.mock("~airtable/tables/requests");

test("should make blocks", async () => {
  requests.findDeliveryNeededRequests.mockResolvedValue([
    makeTestRequests(),
    null
  ]);
  const blocks = await deliveryRoundup();
  const blocksRep = JSON.stringify(blocks, null, "  ");
  expect(blocksRep).toEqual(expect.stringContaining("BBBB"));
  console.log("Blcojs: %s", blocksRep);
});

const makeTestRequests = () => {
  const { fields } = requests;
  const areas = fields.neighborhoodArea_options;
  const fixtures = [
    { code: "AAAA", daysAgo: 1, area: areas.ne },
    { code: "BBBB", daysAgo: 5, area: areas.nw },
    { code: "CCCC", daysAgo: 0, area: areas.sw },
    { code: "DDDD", daysAgo: 3, area: areas.notCrownHeights },
    { code: "EEEE", daysAgo: 1, area: "" },
    { code: "FFFF", daysAgo: 1, area: "" }
  ];
  const makeRecord = f => {
    const now = new Date()
    return new Record(requests.table, null, {
      fields: {
        id: `rec${f.code}`,
        [fields.code]: f.code,
        [fields.time]: new Date().setDate(now.getDate() - f.daysAgo),
        [fields.neighborhoodArea]: f.area,
        [fields.crossStreetFirst]: "Eastern Parkway",
        [fields.crossStreetSecond]: "Ralph"
      }
    });
  };
  return fixtures.map(makeRecord);
};
