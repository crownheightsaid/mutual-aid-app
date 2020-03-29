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

const metaField = "Meta";
const lastModifiedField = "Last Modified";
const lastProcessedField = "Last Processed";
function getNormalizedMeta(record) {
  if (!record.fields[metaField]) {
    return { lastValues: {} };
  }
  const meta = JSON.parse(record.fields[metaField]);
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
        filterByFormula: `({${lastModifiedField}} > '${this.lastModified}')`
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
      delete fields[metaField];
      meta.lastValues = fields;
      updates.push({
        id: record.id,
        fields: {
          [metaField]: JSON.stringify(meta),
          [lastProcessedField]: new Date().toUTCString()
        }
      });
    }
    return this.base.update(updates);
  }

  isModified(record) {
    const fields = _.clone(record.fields);
    const metaRep = fields[metaField] || "{}";
    const meta = JSON.parse(metaRep);
    const lastValues = meta.lastValues || {};
    const ignoredFields = [lastModifiedField, metaField, lastProcessedField];
    for (const ignoredField of ignoredFields) {
      delete fields[ignoredField];
      delete lastValues[ignoredField];
    }
    if (!_.isEqual(fields, meta.lastValues)) {
      return true;
    }
    return false;
  }
}
exports.Changes = Changes;
