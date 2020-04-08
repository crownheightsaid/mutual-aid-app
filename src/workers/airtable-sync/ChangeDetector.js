const _ = require("lodash");
const {
  airbase,
  UPDATE_BATCH_SIZE,
  SENSITIVE_FIELDS
} = require("../../airtable");

// Maps airtable column names
const metaField = "Meta";
const lastModifiedField = "Last Modified";
const lastProcessedField = "Last Processed";

// N second overlap for lastModified
// We are worried that there's clock skew on Airtable's part so we end up overlapping our requests by 5s to try to work around this possibility
const overlapMs = 5 * 1000;

/**
 * Implementation of a simple change detector for Airtable Tables
 * Relies on 2 fields and provides a 3rd:
 * 1) `metaField`:          stores the last values for the row. This is used to determine what has changed and lets you see what the changes were
 * 2) `lastModifiedField`:  set up to be an automatic Last Modified field on Airtable's side. This lets us easily poll for changed/new rows.
 * 3) `lastProcessedField': a datetime field that holds the last time this record was processed through the system
 *
 * The basic flow is to:
 * 1) Find all records where lastModified > the last observed lastModified - an overlapp
 * 2) Check to make sure that non-meta columns have actually changed
 * 3) Update the record's lastProcessed and meta.lastValues to reflect what the state is currently
 * 3) Emit the records that have changed to the caller.
 *
 * Use like:
 *   const detector = new ChangeDetector("YourTableName")
 *   const changes = detector.poll()
 *   for(const changedRecord of changes){
 *    //do something with the record
 *   }
 *   //wait some time and poll again
 */
class ChangeDetector {
  constructor(tableName, writeDelayMs) {
    this.tableName = tableName;
    this.base = airbase(tableName);
    this.lastModified = new Date(0); // Unix epoch 0
    this.writeDelayMs = writeDelayMs || 0; // Unix epoch 0
  }

  /**
   * Returns all the records that have been changed or added since last `poll()`.
   *
   * The Airtable record objects are just a map from field to value:
   *   record.get("field name") // returns current value for "field name"
   * (https://github.com/Airtable/airtable.js/blob/master/lib/record.js)
   *
   * The records are enriched with a few helper functions:
   *   record.getTableName() //returns the table name of the record
   *   record.getPrior("field name")  //returns the prior value for `field` or undefined
   *   record.getMeta() // returns the parsed meta for the record: {"lastValues":{...}}
   *   record.didChange("field name ") // returns true if the field changed (or is new) between the last observation and now
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
   *
   * The overlap means we will observe some records more than once, but
   * since they won't have any actual field changes they will get filtered out.
   *
   * Similarly, since the lastModified is not persisted across instances, an instance will examine
   * (but not report changes or update metadata) for all rows when it is started.
   */
  async getModifiedRecords() {
    const cutoff = new Date(this.lastModified.getTime() - overlapMs);
    const records = await this.base
      .select({
        filterByFormula: `({${lastModifiedField}} > '${cutoff.toISOString()}')`
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
      for (const sensitiveField of SENSITIVE_FIELDS) {
        delete fields[sensitiveField];
      }
      meta.lastValues = fields;
      updates.push({
        id: record.id,
        fields: {
          [metaField]: JSON.stringify(meta),
          [lastProcessedField]: new Date().toISOString()
        }
      });
    }
    let results = [];
    // unfortunately Airtable only allows 10 records at a time to be updated so batck up the changes
    for (const batch of _.chunk(updates, UPDATE_BATCH_SIZE)) {
      /* eslint-disable no-await-in-loop */
      await new Promise(r => setTimeout(r, this.writeDelayMs));
      results += await this.base.update(batch);
    }
    return results;
  }

  /* eslint-disable class-methods-use-this  */
  // it's nice to have it in this scope for organizational purposes
  /**
   * Determines if any of are records fields have changed.
   * This ignores the bookkeeking fields such as metaField and lastProcessedField
   */
  hasFieldChanges(record) {
    const fields = _.clone(record.fields);
    const meta = record.getMeta();
    const { lastValues } = meta;

    const ignoredFields = [
      lastModifiedField,
      metaField,
      lastProcessedField,
      ...SENSITIVE_FIELDS
    ];
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
    this.lastModified = new Date(new Date(maxLastModified).getTime());
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

module.exports = ChangeDetector;
