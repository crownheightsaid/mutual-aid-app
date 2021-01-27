// Adds volunteers to channels based on volunteer form answers.
const _ = require("lodash");
const slackapi = require("~slack/webApi");
const { listMembers, findChannelByName } = require("~slack/channels");
const { getSlackIdForEmail } = require("~slack/users");
const { VOLUNTEER_INTERESTS_TO_SLACK_CHANNELS } = require("~slack/constants");
const {
  volunteersFields,
  volunteersTable,
} = require("~airtable/tables/volunteersSchema");
const { wait } = require("./utils");

/* eslint-disable no-await-in-loop, no-loop-func, guard-for-in, no-continue */
(async () => {
  const allResults = await volunteersTable
    .select({
      fields: [
        volunteersFields.waysToHelp,
        volunteersFields.slackId,
        volunteersFields.email,
      ],
    })
    .all();
  const channelsToUsers = {};
  for (const volunteerRecord of allResults) {
    let volSlackId = volunteerRecord.get(volunteersFields.slackId);
    if (!volSlackId) {
      await wait(200);
      [volSlackId] = await getSlackIdForEmail(
        volunteerRecord.get(volunteersFields.email)
      );
    }
    if (!volSlackId) {
      continue;
    }
    const waysToHelp = volunteerRecord.get(volunteersFields.waysToHelp) || [];
    waysToHelp.forEach((interest) => {
      const relevantChannels = VOLUNTEER_INTERESTS_TO_SLACK_CHANNELS[interest];
      relevantChannels.forEach((channel) => {
        if (!channelsToUsers[channel]) {
          channelsToUsers[channel] = [];
        }
        channelsToUsers[channel].push(volSlackId);
      });
    });
  }

  for (const channelToUpdate in channelsToUsers) {
    const users = channelsToUsers[channelToUpdate];
    const { id: channelId } = await findChannelByName(channelToUpdate);
    const [alreadyUsers] = await listMembers(channelId);
    console.log(`ChannelId: ${channelId}`);
    console.log(`ChannelName: ${channelToUpdate}`);
    console.log(`Total Volunteers for Channel: ${users.length}`);
    console.log(`Already users: ${alreadyUsers.length}`);

    const newUsers = users.filter(
      (user) => !alreadyUsers.includes(user) && user.startsWith("U")
    );

    console.log(`Newly Added: ${newUsers.length}`);
    // Chunk adding users to channel by 50
    for (const newUsersBatch of _.chunk(newUsers, 50)) {
      await wait(1000);
      const inviteResult = await slackapi.conversations.invite({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channelId,
        users: newUsersBatch.join(","),
      });
      console.log(`Invite success: ${inviteResult.ok}`);
    }
  }
})();
