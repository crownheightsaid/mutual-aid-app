const {
  GmailEmailSource,
  getSimplifiedMessage
} = require('./services/gmail-email-source');
const { saveRequest, Request } = require('./airtable');
const source = new GmailEmailSource(process.env.GMAIL_LABEL || 'incoming');

const interval = parseInt(process.env.GMAIL_SYNC_INTERVAL || 5000);

/**
 * Wakes up every $GMAIL_SYNC_INTERVAL and polls gmail for new messages in $GMAIL_LABEL.
 * It sends matching messages to airtable as Requests and then adds a label to them so that they aren't processed twice.
 */
async function syncGmail() {
  try {
    console.info('Spinning up gmail sync');
    const newMessages = await source.poll();

    console.info(`Found ${newMessages.length} to send to airtable`);
    addedMessages = [];
    for (const fullMessage of newMessages) {
      const message = getSimplifiedMessage(fullMessage);
      const request = new Request({
        emailAddress: message.from,
        textOrVoice: 'text',
        message: `${message.subject} - ${message.body}`
      });
      const record = await saveRequest(request);
      console.info(`Sent ${record.getId()} to airtable. Marking as processed.`);
      await source.confirmMessages([fullMessage]);
    }
  } catch (e) {
    console.error('Failed to poll gmail. Rescheduling\n %O', e);
  }
  setTimeout(syncGmail, interval);
}

function startGmailSync() {
  console.log(`Syncing gmail every ${interval}ms`);
  setTimeout(syncGmail, interval);
};

if (require.main === module) {
  //Running as the entrypoint
  startGmailSync();
}
module.exports = { startGmailSync }
