const { Storage } = require("@google-cloud/storage");
const slackapi = require("~slack/webApi");
const { wait } = require("./utils");

/* eslint-disable no-await-in-loop, no-loop-func */

(async () => {
  try {
    const bucketName = "mutual-aid-volunteer-slack.appspot.com";
    const passTheHatFilename = "passTheHat.json";

    // See URL in slack web client for something that looks like C011CU3848G
    let cursor = "";
    let firstRequest = true;

    const storage = new Storage({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY
      }
    });
    const bucket = storage.bucket(bucketName);

    let users = [];
    while (cursor || firstRequest) {
      firstRequest = false;
      let usersResult;
      if (!cursor) {
        usersResult = await slackapi.users.list({
          token: process.env.SLACK_BOT_TOKEN,
          limit: 50
        });
      } else {
        usersResult = await slackapi.users.list({
          token: process.env.SLACK_BOT_TOKEN,
          limit: 50,
          cursor
        });
      }
      cursor = usersResult.response_metadata.next_cursor;

      const userMembers = usersResult.members
        .filter(
          member =>
            !member.is_bot && !member.deleted && !member.id.includes("SLACKBOT")
        )
        .map(u => u.id);
      users = users.concat(userMembers);
      console.log(`Added ${userMembers.length}`);
      await wait(100);
    }
    console.log(`Total PTH users: ${users.length}`);
    const file = bucket.file(passTheHatFilename);
    const res = await file.save(JSON.stringify(users));
    console.log(JSON.parse(res));
  } catch (err) {
    console.log(JSON.stringify(err));
  }
})();
