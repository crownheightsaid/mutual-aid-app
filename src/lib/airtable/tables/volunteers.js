const {
  volunteersTable,
  volunteersFields,
} = require("~airtable/tables/volunteersSchema");

exports.findVolunteerByEmail = async (email) => {
  try {
    const records = await volunteersTable
      .select({
        filterByFormula: `(LOWER({${
          volunteersFields.email
        }}) = '${email.toLowerCase()}')`,
      })
      .firstPage();
    if (!records || records.length === 0) {
      return [null, `No volunteer signed up with email ${email}`];
    }
    return [records[0], null];
  } catch (e) {
    return [null, `Errors looking up volunteer by email ${email}: ${e}`];
  }
};

exports.findVolunteerById = async (id) => {
  try {
    return [await volunteersTable.find(id), null];
  } catch (e) {
    return [null, `Errors looking up volunteer by recordId ${id}: ${e}`];
  }
};

exports.findVolunteerByPhone = async (phone) => {
  try {
    // get the area code, prefix, and line number
    let strippedPhone = phone.replace(/[+|a-zA-Z|\s|(|)|-]/g, "");
    strippedPhone =
      strippedPhone.length === 11 && strippedPhone.startsWith("1")
        ? strippedPhone.slice(1)
        : strippedPhone;

    const records = await volunteersTable
      .select({
        maxRecords: 1,
        filterByFormula: `FIND("${strippedPhone}", ${volunteersFields.phone}) > 0`,
      })
      .firstPage();
    const record = records && records.length ? records[0] : null;

    if (!record) {
      return [null, `404: No volunteer signed up with phone number ${phone}.`];
    }

    return [record, null];
  } catch (e) {
    return [null, `Errors looking up volunteer by phone number ${phone}: ${e}`];
  }
};
