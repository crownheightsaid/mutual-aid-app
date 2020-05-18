const { Storage } = require("@google-cloud/storage");
const _ = require("lodash");
const slackapi = require("~slack/webApi");
const { wait } = require("./utils");
const { str } = require("~strings/i18nextWrappers");

/* eslint-disable no-await-in-loop, no-loop-func */

(async () => {
  try {
    const hatHolders = process.env.HAT_HOLDERS.split(";").map(holder => {
      const holderInfo = holder.split(":");
      return {
        venmoHandle: holderInfo[0],
        slackId: `<@${holderInfo[1]}>`
      };
    });
    const bucketName = "mutual-aid-volunteer-slack.appspot.com";
    const passTheHatFilename = "passTheHat.json";

    const storage = new Storage({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: _.replace(
          process.env.GOOGLE_PRIVATE_KEY,
          new RegExp("\\\\n", "g"),
          "\n"
        )
      }
    });
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(passTheHatFilename);
    const res = await file.download();
    const users = JSON.parse(res[0]);
    console.log(`Total Users: ${users.length}`);

    const daysSinceFirstRun = daysSince(new Date(2020, 5, 12));
    const daysInCycle = 25;
    const dayInCycle = daysSinceFirstRun % daysInCycle;

    // Number of users to receive a DM on a given day
    let groupSize = Math.floor(users.length / daysInCycle);
    const userStartForToday = dayInCycle * groupSize;

    const isEndOfCycle = dayInCycle === daysInCycle - 1;
    if (isEndOfCycle) {
      // Add remaining users to last group
      groupSize += users.length % daysInCycle;
    }

    console.log(`Day in cycle: ${dayInCycle}`);
    console.log(`Group Size: ${groupSize}`);
    const usersToMessage = users.slice(
      userStartForToday,
      userStartForToday + groupSize
    );
    const hatHolder = hatHolders[daysSinceFirstRun % hatHolders.length];
    for (const user of usersToMessage) {
      try {
        await sendMessage(user, hatHolder);
      } catch (e) {
        console.log(`Error for ${user}`);
        if (e.data.error !== "user_not_found") {
          throw e;
        }
        console.log(e);
      }
      await wait(1000);
    }
    console.log(`Processed: ${usersToMessage.length}`);
  } catch (err) {
    console.log(err);
  }
})();

const sendMessage = async (userId, hatHolder) => {
  const dmResponse = await slackapi.conversations.open({
    token: process.env.SLACK_BOT_TOKEN,
    users: `${userId}`
  });
  const dmLines = [
    `Some more details,`,
    `>${str(
      "slackapp:passHat.dm.message.details.first",
      ":rabbit::tophat::question: The rundown: To help fund our grocery aid deliveries and make sure all bills are paid, we’ve created this *hat*, the kind passed around at concerts, collecting tips for the band. Everyday the hat is passed to different CHMA members, but we promise you won’t get the hat again for at least a few weeks!"
    )}`,
    `>${str(
      "slackapp:passHat.dm.message.details.second",
      ":money_with_wings: So if you’re able to donate any amount, whether it’s $3 or $30, please do! You’d be helping out a lot--no donation is too small! If you’re unable to donate, no worries at all! We don't track who is and isn't donating"
    )}`,
    `>${str("slackapp:passHat.dm.message.details.third", {
      defaultValue:
        ":pie: It’s as easy as *venmoing {{- venmoHandle}}*. This Venmo account belongs to {{- venmoUser}} who will disburse the funds they collect to our delivery volunteers in need of reimbursements (receipts posted in #community_reimbursement). Use a :tophat: or :luckyhat: in the venmo comment, or just type in CHMA hat!",
      venmoUser: hatHolder.slackId,
      venmoHandle: hatHolder.venmoHandle
    })}`
  ];
  const messageId = dmResponse.channel.id;
  await slackapi.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    channel: messageId,
    text: str("slackapp:passHat.dm.default", "Pass the hat!"),
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: str(
            "slackapp:passHat.dm.message.intro",
            ":luckyhat: CHMA Hat! :luckyhat:\nHi there! We’re passing the CHMA hat to you today!"
          )
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: str("slackapp:passHat.dm.message.tldr", {
            defaultValue:
              "*tl;dr:* If able, please venmo *{{- venmoHandle}}* a small donation today. They will use all the funds to cover our grocery deliveries! :bike:",
            venmoHandle: hatHolder.venmoHandle
          })
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: dmLines.join("\n")
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: str(
            "slackapp:passHat.dm.message.outro",
            "Thank you for all you do in Crown Heights Mutual Aid! :fist:"
          )
        }
      }
    ]
  });
};

const daysSince = startDate => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const today = new Date();

  return Math.round(Math.abs((today - startDate) / oneDay));
};
