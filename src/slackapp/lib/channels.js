const { find } = require("lodash");
const slackapi = require("../../slackapi");

let channelCache = [];

/**
 * Cached list of all slack channels the bot can see
 */
module.exports.allChannels = async () => {
  if (channelCache.length > 0) {
    return channelCache;
  }
  let cursor = null;
  const channels = [];
  do {
    const response = await slackapi.channels.list({ cursor }); // eslint-disable-line
    cursor = response.response_metadata.next_cursor;
    channels.push(...response.channels);
  } while (cursor);
  channelCache = channels;
  return channelCache;
};

/**
 * Finds a channel by its #name. Returns undefined if no element matches
 */
module.exports.findChannelByName = async name => {
  const bareName = name.replace(/^#/, "");
  return find(await this.allChannels(), c => c.name === bareName);
};

/**
 * Finds a channel by its #name. Returns undefined if no element matches
 */
module.exports.addBotToChannel = async channelId => {
  try {
    const result = await slackapi.conversations.join({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId
    });
    if (!result.ok) {
      throw new Error(result.error);
    }
    return [result, null];
  } catch (e) {
    return [null, `Error adding bot to channel: ${channelId}`];
  }
};
