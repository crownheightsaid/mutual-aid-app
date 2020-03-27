const { google } = require('googleapis');
/*
Service that follows the changes in a Gmail label

This is all sort of complicated by a few things
 1) Keeping up-to-date is a two step process: initial sync followed by history updates [1] 
 2) We need to map labels to label ids
 3) We need to know when a message has already been emitted with minimal state/dependenties.
    Currently, the system sets a XXXX-tracked label on messages it has already emitted
 4) Calls to list messages don't return any content, and there's no batch request to get the conent
    of many messages. There's something in the API itself, but seemingly not the API client.

 [1] https://developers.google.com/gmail/api/guides/sync
*/
class GmailEmailSource {
  constructor(sourceLabel, lastHistoryId = null) {
    this.client = this.makeClient();
    this.lastHistoryId = lastHistoryId; // current position in the history

    this.labels = {
      source: sourceLabel,
      dest: `${sourceLabel}-tracked`
    };
    this.labelCache = null;
  }

  makeClient() {
    const auth = new google.auth.OAuth2(
      process.env['GOOGLE_CLIENT_KEY'],
      process.env['GOOGLE_CLIENT_SECRET']
    );
    auth.setCredentials({
      //see: docs/gmailrefresh-token.md
      refresh_token: process.env['GOOGLE_REFRESH_TOKEN']
    });
    return google.gmail({ version: 'v1', auth });
  }

  // Returns all of the messages that have changed (been added/tagged) with sourceLabel since the last call
  // If it hasn't been called before, return all messages tagged with the label.
  async poll() {
    let results = [];
    if (!this.lastHistoryId) {
      //means we are not already in the middle of following an inbox's history
      results = await this.initialSync();
      for (const message of results) {
        if (this.lastHistoryId < message.historyId) {
          this.lastHistoryId = message.historyId;
        }
      }
    } else {
      //pick up where we left off
      results = await this.pollHistory();
    }
    return results;
  }

  /**
   * Gets the messages in an inbox by paging through the messages.list api.
   * @param {string} pageToken the nextPage toeken from google
   */
  async initialSync(pageToken = null) {
    const listResult = await this.client.users.messages.list({
      userId: 'me',
      nextPageToken: pageToken,
      q: `label:${this.labels.source} -label:${this.labels.dest}`
    });
    const { nextPageToken, messages } = listResult.data;
    const messageIds = (messages || []).map(m => m.id);
    const inflatedMessages = await this.inflateMessages(messageIds);
    if (nextPageToken != null) {
      const nextPage = await this.initialSync(nextPageToken);
      return inflatedMessages + nextPage;
    }
    return inflatedMessages;
  }

  /**
   * Gets the history of changes since the last poll. This is paginated so there are two things going on:
   * 1) poll for the changes since lastHistoryId
   * 2) page through the results (lather/rinse/repeat)
   * @param {string} pageToken the nextPage token
   */
  async pollHistory(pageToken = null) {
    const sourceLabelId = await this.getLabelId(this.labels.source);
    const destLabelId = await this.getLabelId(this.labels.dest);
    const response = await this.client.users.history.list({
      userId: 'me',
      historyTypes: ['messageAdded', 'labelAdded'],
      labelId: sourceLabelId,
      startHistoryId: this.lastHistoryId,
      pageToken
    });
    const { history, historyId } = response.data;
    if (!history) {
      return [];
    }
    if (this.lastHistoryId < historyId) {
      this.lastHistoryId = historyId;
    }
    const messageIds = {};
    for (const historyItem of history) {
      if (historyItem.messagesAdded) {
        console.info(
          `Found ${historyItem.messagesAdded.length} new messages.`
        );
        for (const m of historyItem.messagesAdded) {
          messageIds[m.id] = true;
        }
      }
      if (historyItem.labelsAdded) {
        console.info(
          `Found ${historyItem.labelsAdded.length} messages with changed labels.`
        );
        for (const labelChange of historyItem.labelsAdded) {
          if (
            labelChange.labelIds.includes(sourceLabelId) &&
            !labelChange.message.labelIds.includes(destLabelId)
          ) {
            messageIds[labelChange.message.id] = true;
          }
        }
      }
    }
    const messages = this.inflateMessages(Object.keys(messageIds));
    if (history.nextPageToken) {
      return messages + (await this.pollHistory(history.nextPageToken));
    }
    return messages;
  }

  // Turn a sequence of Gmail messageIds to Message objects
  async inflateMessages(messageIds) {
    if (!messageIds) {
      return null;
    }
    return Promise.all(messageIds.map(m => this.inflateMessage(m)));
  }
  /**
   * Adds a label to the given messages to mark them as confirmed. These messages won't be polled again.
   */
  async confirmMessages(messages) {
    if (!messages || messages.length == 0) {
      return null;
    }
    const destLabelId = await this.getLabelId(this.labels.dest);
    const changes = {
      userId: 'me',
      requestBody: {
        ids: messages.map(m => m.id),
        addLabelIds: [destLabelId]
      }
    };
    const response = await this.client.users.messages.batchModify(changes);
    return response.data;
  }

  async inflateMessage(messageId) {
    console.info(`Inflating message: ${messageId}`);
    const resp = await this.client.users.messages.get({
      userId: 'me',
      format: 'full',
      id: messageId
    });
    return resp.data;
  }

  async getLabelId(labelName) {
    if (!this.labelCache) {
      const response = await this.client.users.labels.list({
        userId: 'me'
      });
      const labelsByName = response.data.labels.map(l => [l.name, l]);
      this.labelCache = Object.fromEntries(labelsByName);
    }
    return this.labelCache[labelName].id;
  }
}

/**
 * The GMail representation of an email is very... featureful.
 * This pares it down to the things that we care about
 */
function getSimplifiedMessage(message) {
  const { payload } = message;
  const { headers } = payload;
  let subject = 'No Subject';
  let from = '';
  for (const header of headers) {
    if (header.name.toLowerCase() === 'subject') {
      subject = header.value;
    } else if (header.name.toLowerCase() === 'from') {
      from = header.value;
    }
  }
  return {
    from,
    subject,
    body: getBody(payload)
  };
}

function getBody(payload) {
  const { body, parts, mimeType } = payload;
  if (mimeType == 'multipart/alternative' || mimeType == 'multipart/related') {
    for (const part of parts) {
      //prefer plaintext
      if (part.mimeType == 'text/plain') {
        return getBody(part);
      }
    }
    return getBody(parts[0]); //Use first if no plaintext
  }
  const buff = Buffer.from(body.data, 'base64');
  return buff.toString('utf-8');
}

module.exports = {
  GmailEmailSource,
  getSimplifiedMessage
};
