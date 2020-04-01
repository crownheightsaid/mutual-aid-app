const _ = require("lodash");
const { airbase } = require("../../airtable");

// Maps airtable column names
const metaField = "Meta";
const lastModifiedField = "Last Modified";
const lastProcessedField = "Last Processed";

const overlap = 5 * 1000; // N second overlap for lastModified

/**
 * Implementation of a simple change detector for Airtable Tables
 * Relies on 2 fields and provides a 3rd:
 * 1) `metaField`:          stores the last values for the row. This is used to determine what has changed and lets you see what the changes were
 * 2) `lastModifiedField`:  set up to be an automatic Last Modified field on Airtable's side. This lets us easily poll for changed/new rows.
 * 3) `lastProcessedField': a datetime field that holds the last time this record was processed through the system
 *
 * The basic flow is to:
 * 1) Find all records where lastModified > lastProcessed
 * 2) Check to make sure that non-meta columns have actually changed
 * 3) Emit the records that have changed for further processing.
 * 4) Update the record's lastProcessed and meta.lastValues to reflect what the state is currently
 *
 * Use like:
 *   const detector = new ChangeDetector("Table")
 *   const changes = detector.poll()
 *   for(const changedRecord of changes){
 *    //do something with the record
 *   }
 *   //maybe poll again?
 */
class ChangeDetector {
  constructor(tableName) {
    this.tableName = tableName;
    this.base = airbase(tableName);
    this.lastModified = new Date(0); // Unix epoch 0
  }

  /**
   * Returns all the records that have been changed or added since last `poll()`
   * The records are enriched with a few helper functions:
   *   record.getTableName() //returns the table name of the record
   *   record.getPrior(field)  //returns the prior value for `field` or undefined
   *   record.getMeta() // returns the parsed meta for the record: {"lastValues":{...}}
   *   record.didChange(field) // returns true if the field changed (or is new) between the last observation and now
   */
  async poll() {
    const toExamine = await this.getModifiedRecords();
    const recordsWithFieldChanges = toExamine.filter(this.hasFieldChanges);
    const results = recordsWithFieldChanges.map(r => _.cloneDeep(r));
    this.updateLastModified(toExamine);
    if (results.length === 0) {
      return results;
    }
    await this.updateRecords(recordsWithFieldChanges);
    return results;
  }

  /**
   * Gets all the records that have changed since lastModified (- a overlap)
   */
  async getModifiedRecords() {
    const records = await this.base
      .select({
        filterByFormula: `({${lastModifiedField}} > '${this.lastModified.toISOString()}')`
      })
      .all();
    return records.map(this.enrichRecord);
  }

  /**
   * Updates the bookkeeing information in Airtable: metaField and lastProcessedField
   */
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
          [lastProcessedField]: new Date().toISOString()
        }
      });
    }
    return this.base.update(updates);
  }

  /**
   * Determines if any of are records fields have changed.
   * This ignores the bookkeeking fields such as metaField and lastProcessedField
   */
  hasFieldChanges(record) {
    const fields = _.clone(record.fields);
    const meta = record.getMeta();
    const { lastValues } = meta;

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

  /**
   * Adds some extra methods to the record
   *   record.getTableName() //returns the table name of the record
   *   record.getPrior(field)  //returns the prior value for `field` or undefined
   *   record.getMeta() // returns the parsed meta for the record: {"lastValues":{...}}
   *   record.didChange(field) // returns true if the field changed (or is new) between the last observation and now
   */
  enrichRecord(record) {
    const meta = getNormalizedMeta(record);
    const { lastValues } = meta;
    const enriched = _.cloneDeep(record);
    const lastSetValues = _.keys(lastValues);
    enriched.getTableName = () => this.tableName;
    enriched.getPrior = field => lastValues[field];
    enriched.getMeta = () => meta;
    enriched.didChange = field =>
      lastSetValues.length === 0 ||
      enriched.getPrior(field) !== enriched.get(field);
    return enriched;
  }

  /**
   * Push this instance's lastModified forward based on the latest modification date of the given fields
   */
  updateLastModified(records) {
    const maxLastModified = _.max(records.map(r => r.get(lastModifiedField)));
    this.lastModified = new Date(new Date(maxLastModified).getTime() - overlap);
  }
}

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

module.exports = {
  ChangeDetector,
  airbase
};
