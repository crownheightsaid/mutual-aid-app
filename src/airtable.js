const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);

exports.findVolunteerByEmail = async email => {
  console.log(email);
  await base("Volunteers")
    .select({
      filterByFormula: `({volunteer_email} = '${email}')`
    })
    .firstPage(function(err, records) {
      if (err) {
        console.error(err);
        return;
      }
      console.log(records);
      records.forEach(function(record) {
        console.log("Retrieved", record.get("volunteer_email"));
      });
    });
  // .firstPage((err, records) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   records.forEach(function(record) {
  //     console.log("Retrieved", record.get("volunteer_email"));
  //   });
  // });
};

exports.airbase = base;
