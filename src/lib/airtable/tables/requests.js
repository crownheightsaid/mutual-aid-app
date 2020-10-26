const { merge } = require("lodash");
const _ = require("lodash");
const { table, fields } = require("./requestsSchema");

const requestNotInSlack = (r) => {
  const meta = r.get(fields.meta);
  let parsed = {};
  try {
    parsed = JSON.parse(meta);
  } catch {
    console.log("Invalid meta %s: %O", r.get(fields.code), meta);
  }
  return parsed.slack_ts === undefined;
};

// Delivery cluster requests are handled separately
const notForDrivingCluster = (r) => {
  const forDrivingCluster = r.get(fields.forDrivingClusters);
  return !forDrivingCluster;
};

exports.deleteRequest = async (recordId) => {
  console.log("Deleting record");
  try {
    const records = await table.destroy([recordId]);
    return [records[0], null];
  } catch (e) {
    console.error(`Couldn't delete request: ${e}`);
    return [null, e];
  }
};

exports.createRequest = async (request) => {
  // TODO: add asserts for non-|| fields below
  console.log("creating record");
  try {
    const record = await table.create({
      [fields.message]: request.message,
      [fields.phone]: request.phone || "",
      [fields.type]: request.source,
      [fields.externalId]: request.externalId || "",
      [fields.crossStreetFirst]: request.crossStreets || "",
      [fields.email]: request.email || "",
      [fields.timeSensitivity]: request.urgency || "",
      [fields.status]: request.status || fields.status_options.dispatchNeeded,
    });
    return [record, null];
  } catch (e) {
    console.error(`Couldn't create request: ${e}`);
    return [null, e];
  }
};

exports.findRequestByExternalId = async (externalId) => {
  try {
    const record = await table
      .select({
        filterByFormula: `({${fields.externalId}} = '${externalId}')`,
      })
      .firstPage();
    return record
      ? [record[0], null]
      : [null, "Request with that external ID not found"];
  } catch (e) {
    console.error(`Error while fetching request by eID: ${e}`);
    return [null, e];
  }
};

/** Finds all requests in an open state (ie 'delivery needed' status) in Airtable */
exports.findDeliveryNeededRequests = async () => {
  const filterByFormula = `OR({${fields.status}} = '${fields.status_options.deliveryNeeded}')`;
  try {
    const requests = await table
      .select({
        filterByFormula,
      })
      .all();

    return [requests, null];
  } catch (e) {
    return [[], `Error while looking up open requests: ${e}`];
  }
};

// Returns requests that are to be posted in a public requests channel
exports.findOpenRequestsForSlack = async () => {
  const requestOpenStates = [
    fields.status_options.dispatchStarted,
    fields.status_options.deliveryNeeded,
  ];
  const statusConstraints = requestOpenStates.map(
    (s) => `{${fields.status}} = '${s}'`
  );
  const formula = `OR(${statusConstraints.join(", ")})`;
  try {
    const requests = await table
      .select({
        filterByFormula: formula,
      })
      .all();

    return [
      requests.filter(requestNotInSlack).filter(notForDrivingCluster),
      null,
    ];
  } catch (e) {
    return [[], `Error while looking up open requests: ${e}`];
  }
};

exports.findRequestByCode = async (code) => {
  if (code && code.length < 4) {
    return [null, `Request code must be at least 4 characters.`];
  }
  try {
    const records = await table
      .select({
        filterByFormula: `(FIND('${code}', {${fields.code}}) > 0)`,
      })
      .firstPage();
    if (records.length === 0) {
      return [null, "No requests found with that code."];
    }
    const record = records[0];
    return [record, null];
  } catch (e) {
    return [null, `Error while finding request: ${e}`];
  }
};

exports.findRequestByPhone = async (phone) => {
  try {
    const records = await table
      .select({
        maxRecords: 1,
        fields: [fields.phone],
        filterByFormula: `({${fields.phone}} = '${phone}')`,
      })
      .firstPage();
    if (records && records.length === 0) {
      return [null, "No existing request with that phone"];
    }
    return [records[0], null];
  } catch (e) {
    return [null, `Error while finding request: ${e}`];
  }
};

// `update` should look like:
// {
//   "Some Requests Field": "New Value",
//   "Another field": "Another New Value"
//   "Meta": {key: "value"}
// }
exports.updateRequestByCode = async (code, update) => {
  if (code && code.length < 4) {
    return [null, `Request code must be at least 4 characters.`];
  }
  try {
    const records = await table
      .select({
        filterByFormula: `(FIND('${code}', {${fields.code}}) > 0)`,
      })
      .firstPage();
    if (records.length === 0) {
      return [null, `No requests found with code: ${code}`];
    }
    if (update[fields.meta]) {
      // Support for updating Meta as an object (rather than string)
      /* eslint no-param-reassign: ["error", { "props": false }] */
      const parsed = JSON.parse(records[0].get(fields.meta));
      merge(parsed, update[fields.meta]);
      update[fields.meta] = JSON.stringify(parsed);
    }
    const record = records[0];
    const airUpdate = {
      id: record.id,
      fields: update,
    };
    const updatedRecords = await table.update([airUpdate]);
    return [updatedRecords[0], null];
  } catch (e) {
    return [null, `Error while processing update: ${e}`];
  }
};

exports.unlinkSlackMessage = async (slackTs, slackChannel) => {
  const tsFilter = `"slack_ts":"${slackTs}"`;
  const channelFilter = `"slack_channel":"${slackChannel}"`;
  const filter = `AND(SEARCH('${tsFilter}', {${fields.meta}}), SEARCH('${channelFilter}', {${fields.meta}}))`;
  await table
    .select({
      filterByFormula: filter,
    })
    .eachPage((records, fetchNextPage) => {
      records.forEach(async (record) => {
        const meta = removeSlackMeta(record.get(fields.meta));

        try {
          await table.update([
            { id: record.id, fields: { [fields.meta]: meta } },
          ]);
        } catch (e) {
          console.error("Error updating Request %O %O", record.id, e);
        }
      });

      fetchNextPage();
    });
};

const removeSlackMeta = (meta) =>
  _.chain(meta)
    .thru(JSON.parse)
    .omit("slack_ts")
    .omit("slack_channel")
    .thru(JSON.stringify)
    .value();
