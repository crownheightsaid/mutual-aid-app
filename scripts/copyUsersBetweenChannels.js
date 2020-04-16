const _ = require("lodash");
const slackapi = require("../src/slackapi");
const { wait } = require("./utils");

/* eslint-disable no-await-in-loop, no-loop-func */

const isUserInChannel = async (userId, channelId) => {
  const convoResult = await slackapi.users.conversations({
    token: process.env.SLACK_BOT_TOKEN,
    user: userId,
    types: "public_channel,private_channel"
  });
  return !!convoResult.channels.filter(channel => channel.id === channelId)
    .length;
};

(async () => {
  try {
    // See URL in slack web client for something that looks like C011CU3848G
    const channelFromId = "C01142F7PSQ";
    const channelToId = "C012DUBS50Q";
    let cursor = "";
    let firstRequest = true;

    while (cursor || firstRequest) {
      firstRequest = false;
      let usersResult;
      if (!cursor) {
        usersResult = await slackapi.conversations.members({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelFromId,
          limit: 20
        });
      } else {
        usersResult = await slackapi.conversations.members({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelFromId,
          limit: 20,
          cursor
        });
      }
      cursor = usersResult.response_metadata.next_cursor;

      // const userMembers = usersResult.members.filter(
      //   member => !member.is_bot && !member.id.includes("SLACKBOT")
      // );
      const userIds = usersResult.members;
      const notAddedUserIds = [];
      for (const userId of userIds) {
        try {
          await wait(1200);
          const userInChannel = await isUserInChannel(userId, channelToId);
          console.log(`In channel: ${userInChannel}`);
          !userInChannel && notAddedUserIds.push(userId);
        } catch (e) {
          console.log(`Error looking up user: ${JSON.stringify(e)}`);
        }
      }
      if (notAddedUserIds.length !== 0) {
        console.log("User Ids To add:");
        console.log(notAddedUserIds.length);
        const inviteResult = await slackapi.conversations.invite({
          token: process.env.SLACK_BOT_TOKEN,
          channel: channelToId,
          users: notAddedUserIds.join(",")
        });

        console.log("Invite result:");
        console.log(JSON.stringify(inviteResult));
      } else {
        console.log("No users to add :)");
      }
    }
  } catch (err) {
    console.log("error");
    console.log(err);
  }
})();
