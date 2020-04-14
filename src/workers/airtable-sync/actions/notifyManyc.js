module.exports = async function notifyManyc(record) {
  const statusFieldName = "Status";

  const assignedStatus =
    record.get(statusFieldName) === "Dispatch Started" ||
    record.get(statusFieldName) === "Delivery Needed";
  if (
    record.getPrior(statusFieldName) === "Dispatch Needed" &&
    assignedStatus
  ) {
    return sendManycStatus("assigned");
  }
  if (record.get(statusFieldName) === "Request Complete") {
    return sendManycStatus("completed");
  }
  return "No Update";
};

async function sendManycStatus(status) {}
