const slackapi = require("../../slackapi");
const { findVolunteerById, airbase } = require("../../airtable");

/**
 * Posts the new delivery message to slack.
 */
async function newDeliveryRequest(request) {
  // We need to look up the user from slack because we need the raw slack id to mention
  // the user in the message correctly if they have spaces in their display name.
  const slackUser = await getVolunteerSlackUser(
    request.get("Intake volunteer")
  );
  const area = request.get("Neighborhood Area (See Map)");
  const notificationText = `A new need was posted in ${area}`; // this message shows up in notifications
  const message = newDeliveryRequestTemplate(request, slackUser.id);
  return slackapi.chat.postMessage({
    channel: "#community_needs",
    text: notificationText,
    blocks: message.blocks,
    username: slackUser.name
  });
}

/**
 * Gets the volinteer's defailed slack info.
 * @param {string} volunteerId the Volunterr's airtable record id i.e. recEl2qtFTTgwZXfZ
 */
async function getVolunteerSlackUser(volunteerId) {
  let volunteerSlackName = volunteerId;
  try {
    const intakeVolunteer = await findVolunteerById(volunteerId);
    volunteerSlackName = intakeVolunteer.get("volunteer_slack_id");
    const result = await slackapi.users.lookupByEmail({
      email: intakeVolunteer.get("volunteer_email")
    });
    return result.user;
  } catch {
    // means the user didn't register slack with the same email
    return {
      id: volunteerSlackName,
      name: volunteerSlackName
    };
  }
}

/**
 * Builds the block template for the new delivery request message:
 * https://api.slack.com/tools/block-kit-builder?mode=message&blocks=%5B%7B%22type%22%3A%22section%22%2C%22text%22%3A%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22%3Ared_circle%3A%20Hi%20%40channel%20we%27ve%20got%20a%20new%20request%20to%20deliver%20groceries%20for%20our%20neighbor%20at%20Bristol%20St%20%26%20Pitkin%20in%20Other%20-%20not%20Crown%20Heights%3A%22%7D%7D%2C%7B%22type%22%3A%22section%22%2C%22fields%22%3A%5B%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22*Timeline%3A*%201-2%20days%22%7D%2C%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22*Neighborhood%3A*%20Other%20-%20not%20Crown%20Heights%22%7D%2C%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22*Cross%20Streets%3A*%20Bristol%20St%20%26%20Pitkin%22%7D%2C%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22*Language%3A*%20English%22%7D%5D%7D%2C%7B%22type%22%3A%22section%22%2C%22text%22%3A%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22*Description*%3A%5Cnmeat%20(canned%20corned%20beef%2C%20chicken%2C%20chopped%20turkey)%20whole%20milk%2C%20cereal%20(fruity%20pebbles%20and%20fruit%20loops)%2C%20laundry%20detergent%2C%20white%20rice%2C%20dove%20soap%2C%20dove%20deodorant%2C%20canned%20veggies%22%7D%7D%2C%7B%22type%22%3A%22divider%22%7D%2C%7B%22type%22%3A%22section%22%2C%22text%22%3A%7B%22type%22%3A%22mrkdwn%22%2C%22text%22%3A%22*Want%20to%20volunteer%20to%20help%20our%20neighbor%20at%20Bristol%20St%20%26%20Pitkin%20%3F*%20Comment%20on%20this%20thread%20and%20%3C%40U010VK3Q821%3E%20will%20follow%20up%20with%20you!%5Cn_Reminder%3A%20Please%20don%E2%80%99t%20volunteer%20for%20delivery%20if%20you%E2%80%99ve%20traveled%20out%20of%20the%20country%20in%20the%20last%2014%20days%2C%20have%20any%20COVID-19%2Fcold%2Fflu-like%20symptoms%2C%20or%20have%20come%20into%20contact%20with%20someone%20that%E2%80%99s%20tested%20positive.%20We%20will%20follow%20up%20with%20no-contact-delivery%20instructions%20once%20you%20sign%20up_%22%7D%7D%2C%7B%22type%22%3A%22actions%22%2C%22elements%22%3A%5B%7B%22type%22%3A%22button%22%2C%22text%22%3A%7B%22type%22%3A%22plain_text%22%2C%22emoji%22%3Atrue%2C%22text%22%3A%22Volunteer!%22%7D%2C%22style%22%3A%22primary%22%2C%22value%22%3A%22click_me_123%22%7D%5D%7D%5D
 * @param {*} request airtable request instance
 * @param {string} intakeSlackId A real slack id I.E U1234
 */
function newDeliveryRequestTemplate(request, intakeSlackId) {
  const streets = [
    request.get("Cross Street #1"),
    request.get("Cross Street #2")
  ].join(" & ");

  const name = `our neighbor at ${streets}`;
  const quadrant = request.get("Neighborhood Area (See Map)");
  const services = "deliver groceries"; // request.get("What type(s) of support are you seeking?").join("")

  const extraFields = [
    ["Timeline", request.get("Time Sensitivity")],
    ["Neighborhood", request.get("Neighborhood Area (See Map)")],
    ["Cross Streets", streets],
    ["Language", (request.get("Languages") || []).join("/")]
  ];
  const description = request.get("Intake General Notes");
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:red_circle: Hi @channel we've got a new request to ${services} for ${name} in ${quadrant}:`
        }
      },
      {
        type: "section",
        fields: extraFields.map(pair => {
          return {
            type: "mrkdwn",
            text: `*${pair[0]}:* ${pair[1]}`
          };
        })
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Description*:\n${description}`
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Want to volunteer to help ${name} ?* Comment on this thread and <@${intakeSlackId}> will follow up with you!\n_Reminder: Please don’t volunteer for delivery if you’ve traveled out of the country in the last 14 days, have any COVID-19/cold/flu-like symptoms, or have come into contact with someone that’s tested positive. We will follow up with no-contact-delivery instructions once you sign up_`
        }
      }
      /*
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "Volunteer!"
            },
            style: "primary",
            value: "click_me_123"
          }
        ]
      }
      */
    ]
  };
}

module.exports = newDeliveryRequest;

// Helper to manually force sending a message
if (require.main === module) {
  const id = process.argv[2];
  console.log(`Manually sending message for ${id}`);
  airbase("Requests")
    .select({ filterByFormula: `({Request ID} = '${id}')` })
    .firstPage()
    .then(async rows => {
      if (rows.length === 0) {
        console.log(`Could not find Request: ${id}`);
        return;
      }
      const row = rows[0];
      const res = await newDeliveryRequest(row);
      console.log(res);
    })
    .catch(console.error);
}
