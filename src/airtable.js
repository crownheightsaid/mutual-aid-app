const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);

exports.findVolunteerByEmail = async email => {
  const record = await base("Volunteers")
    .select({
      filterByFormula: `{volunteer_email} = '${email}')`
    })
    .firstPage();
  console.log("here");
  console.log(record);
  record.forEach(r => {
    console.log("Retrieved", r.get("volunteer_email"));
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
