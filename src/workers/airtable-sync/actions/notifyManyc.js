const axios = require("axios");
const { fields: requestsFields } = require("~airtable/tables/requestsSchema");

module.exports = async function notifyManyc(record) {
  const manycId = record.get(requestsFields.externalId);
  if (!manycId) {
    console.log("No manyc ID for manyc request.");
    return;
  }
  if (!process.env.MANYC_WEBHOOK_URL) {
    console.log("No manyc webhook URL.");
    return;
  }

  const isComplete =
    record.didChange(requestsFields.status) &&
    record.get(requestsFields.status) ===
      requestsFields.status_options.requestComplete;
  const hasNewIntakeVolunteer =
    record.didChange(requestsFields.intakeVolunteer) &&
    !record.getPrior(requestsFields.intakeVolunteer);

  if (isComplete) {
    await sendManycStatus("completed", manycId);
  } else if (hasNewIntakeVolunteer) {
    await sendManycStatus("assigned", manycId);
  }
};

async function sendManycStatus(status, manycId) {
  try {
    const res = await axios.post(process.env.MANYC_WEBHOOK_URL, {
      manyc: {
        id: manycId,
        status,
      },
    });
    if (res.status !== 200) {
      console.log(`Manyc webhook failed: ${res.statusText}`);
    }
  } catch (error) {
    console.error(`Manyc webhook failed: ${error}`);
  }
}
