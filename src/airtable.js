const Airtable = require('airtable');

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

class Request {

  /**
   * The mapping between a model object an Airtable's fields.
   * We do this because airtable only supports setting by name,
   * so we would like a single place to map the name to an internal
   * symbol: "Email Address" -> "emailAddress"
   */
  airtableBindings = {
    //these are set by airtable
    requestId: 'Request ID',
    airtableRecord: 'Airtable Record',
    time: 'Time',
    //and these we set
    phone: 'Phome',
    emailAddress: 'Email Address',
    textOrVoice: 'Text or Voice?',
    message: 'Message'
  };

  /**
   *
   * @param {Object} opts
   * @param {string} opts.phone
   * @param {"text"|"voice"} opts.textOrVoice
   * @param {string} opts.message
   */
  constructor(opts = {}) {
    this.airtableRecord = opts.airtableRecord;
    this.requestId = opts.requestId;
    this.time = opts.time;

    this.phone = opts.phone;
    this.textOrVoice = opts.textOrVoice;
    this.message = opts.message;
    this.emailAddress = opts.emailAddress
  }

  toAirtableRepresentation() {
    const airtableRep = {};
    for (const prop of Object.keys(this.airtableBindings)) {
      const airtablePropertyName = this.airtableBindings[prop];
      airtableRep[airtablePropertyName] = this[prop];
    }
    return airtableRep;
  }
}
/**
 * Saves a request ao Airtable
 * @param {Request} request
 */
exports.saveRequest = async request => {
  const record = await base("Requests").create(
    request.toAirtableRepresentation()
  );
  return record;
};

exports.airbase = base;
exports.Request = Request;
