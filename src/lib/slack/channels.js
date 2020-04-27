// Helpers related to Slack channels

const { find } = require("lodash");
const slackapi = require("~slack/webApi");

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
    /* eslint-disable-next-line no-await-in-loop */
    const response = await slackapi.conversations.list({
      types: "public_channel,private_channel",
      cursor
    });
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
 * Adds the current bot to the given channel
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

module.exports.isUserInChannel = async (userId, channelName) => {
  try {
    const convoResult = await slackapi.users.conversations({
      token: process.env.SLACK_BOT_TOKEN,
      user: userId,
      types: "public_channel,private_channel",
      exclude_archived: true
    });
    return [
      !!convoResult.channels.filter(channel =>
        channel.name.includes(channelName.replace("#", ""))
      ).length,
      null
    ];
  } catch (e) {
    return [null, e];
  }
};

/**
 * Returns the user ids of the members of the given channel
 */
module.exports.listMembers = async channelId => {
  let cursor = null;
  const members = [];
  try {
    do {
      /* eslint-disable-next-line no-await-in-loop */
      const response = await slackapi.conversations.members({
        channel: channelId,
        cursor
      });
      cursor = response.response_metadata.next_cursor;
      members.push(...response.members);
    } while (cursor);
  } catch (e) {
    return [[], e];
  }
  return [members, null];
};
