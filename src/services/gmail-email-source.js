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
  constructor(sourceLabel, scrollToken = null) {
    this.client = this.makeClient();
    this.scrollToken = scrollToken; // current position in the history

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
  // If it hasn't been called before, return all messages tagged with the label
  async poll() {
    let results = [];
    if (!this.scrollToken) {
      results = await this.initialSync();
      for (const message of results) {
        if (this.scrollToken < message.historyId) {
          this.scrollToken = message.historyId;
        }
      }
    } else {
      results = await this.pollHistory();
    }
    return results;
  }

  async initialSync(token = null) {
    const listResult = await this.client.users.messages.list({
      userId: 'me',
      nextPageToken: token,
      q: `label:${this.labels.source} -label:${this.labels.dest}`
    });
    const { nextPageToken, messages } = listResult.data;
    const messageIds = messages.map(m => m.id);
    const inflatedMessages = await this.inflateMessages(messageIds);
    if (nextPageToken != null) {
      const nextPage = await this.initialSync(nextPageToken);
      return inflatedMessages + nextPage;
    }
    return inflatedMessages;
  }

  async pollHistory(pageToken = null) {
    const sourceLabelId = await this.getLabelId(this.labels.source);
    const response = await this.client.users.history.list({
      userId: 'me',
      historyTypes: ['messageAdded', 'labelAdded'],
      labelId: sourceLabelId,
      startHistoryId: this.scrollToken,
      pageToken
    });
    const { history, historyId } = response.data;
    if (!history) {
      return [];
    }
    if (this.scrollToken < historyId) {
      this.scrollToken = historyId;
    }
    const messageIds = {};
    for (const historyItem of history) {
      for (const m of historyItem.messagesAdded || []) {
        messageIds[m.id] = true;
      }
      for (const m of historyItem.labelsAdded || []) {
        if (m.labelIds.includes(sourceLabelId)) {
          messageIds[m.id] = true;
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
    return Promise.all(messageIds.map(m => this.inflateMessage(m)));
  }

  async inflateMessage(messageId) {
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
    return this.labelCache[labelName];
  }
}
module.exports = GmailEmailSource;
