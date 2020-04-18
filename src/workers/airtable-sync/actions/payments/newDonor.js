module.exports = newDonor;

async function newDonor(record) {
  console.debug(
    `New Donor: ${record.get("ID")}  |  ${record.get(
      "FirstName"
    )}  |  ${record.get("Amount")}  |  ${record.get("Created")}`
  );
}
