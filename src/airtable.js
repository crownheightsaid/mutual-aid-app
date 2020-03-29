const Airtable = require("airtable");
const _ = require("lodash");

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);

exports.findVolunteerByEmail = async email => {
  const record = await base("Volunteers")
    .select({
      filterByFormula: `({volunteer_email} = '${email}')`
    })
    .firstPage();
  return record ? record[0] : null;
};

exports.airbase = base;

function getNormalizedMeta(record) {
  if (!record.fields.Meta) {
    return { lastValues: {} };
  }
  const meta = JSON.parse(record.fields.Meta);
  if (!meta.lastValues) {
    meta.lastValues = {};
  }
  return meta;
}

class Changes {
  constructor(baseName) {
    this.base = base(baseName);
    this.lastModified = "2000-01-01";
  }

  async poll() {
    const recordsModified = await this.getModifiedRecords();
    const results = recordsModified.map(r => _.cloneDeep(r));
    await this.updateRecords(recordsModified);
    return results;
  }

  async getModifiedRecords() {
    const records = await this.base
      .select({
        filterByFormula: `({Last Modified} > '${this.lastModified}')`
      })
      .all();
    return records.filter(this.isModified);
  }

  async updateRecords(records) {
    if (records.length === 0) {
      return [];
    }
    const updates = [];
    for (const record of records) {
      const fields = _.clone(record.fields);
      const meta = getNormalizedMeta(record);
      delete fields.Meta;
      meta.lastValues = fields;
      updates.push({
        id: record.id,
        fields: { Meta: JSON.stringify(meta) }
      });
    }
    return this.base.update(updates);
  }

  isModified(record) {
    const fields = _.clone(record.fields);
    const metaRep = fields.Meta || "{}";
    const meta = JSON.parse(metaRep);
    const lastValues = meta.lastValues || {};
    delete fields.Meta;
    delete fields["Last Modified"];
    delete lastValues["Last Modified"];

    if (!_.isEqual(fields, meta.lastValues)) {
      return true;
    }
    return false;
  }
}
exports.Changes = Changes;
