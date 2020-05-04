const { groupBy, orderBy, keys, sortBy, values } = require("lodash");
const { findDeliveryNeededRequests } = require("~airtable/tables/requests");
const { fields } = require("~airtable/tables/requests");
const { str } = require("~strings/i18nextWrappers");

const REQUEST_OVERDUE_DAYS = 4;
const REQUEST_DRAGGING_DAYS = 2;
const VISIBLE_REQUESTS_PER_SUBNEIGHBORHOOD = 5;
const DELIVERY_NEEDED_MAP_LOCATION = "";
const MS_PER_DAY = 60 * 60 * 24 * 1000;

module.exports = async () => {
  const blocks = [];
  blocks.push(
    markdownSection(str("slackapp:home.volunteerSignUp.formButton.url"))
  );
  blocks.push(markdownSection(str("slackapp:deliverySummaryPost.intro")));

  const [requests, err] = await findDeliveryNeededRequests();
  if (err) {
    const errorText = str("slackapp:deliverySummaryPost.error", {
      error: err,
      channel: str("webapp:slack.techChannel")
    });
    blocks.push(markdownSection(errorText));
    return blocks;
  }

  if (!requests) {
    const noRequestText = str("slackapp:deliverySummaryPost.noOpenRequests", {
      error: err
    });
    blocks.push(markdownSection(noRequestText));
    return blocks;
  }

  const requestsByAge = orderBy(requests, r => r.get(fields.time)).reverse();
  const neighborhoodAreaGroups = groupBy(requestsByAge, r => [
    // Some not-crown-heights requests seem to have a blank area
    r.get(fields.neighborhoodArea) ||
      fields.neighborhoodArea_options.notCrownHeights
  ]);
  const allAreas = values(fields.neighborhoodArea_options);
  const areas = allAreas.filter(a => neighborhoodAreaGroups[a]);
  console.log(areas);
  for (const area of areas) {
    const areaRequests = neighborhoodAreaGroups[area];
    blocks.push(divider);
    const selected = areaRequests.slice(
      0,
      VISIBLE_REQUESTS_PER_SUBNEIGHBORHOOD
    );
    const headerText = str("slackapp:deliverySummaryPost.neighborhoodHeader", {
      name: area,
      count: selected.length
    });
    blocks.push(markdownSection(headerText));
    for (const request of selected) {
      const age = getAge(request);
      const priorityCategory = getPriorityCategory(age);
      const crossStreets = getCrossStreets(request);
      const slackLink = await getSlackLink(request); // eslint-disable-line no-await-in-loop
      let ageKey = "slackapp:deliverySummaryPost.age";
      if (age === 0) {
        ageKey += "_0";
      }
      const ageText = str(ageKey, {
        count: age
      });
      const requestText = str("slackapp:deliverySummaryPost.requestRow", {
        code: request.get(fields.code),
        badgeEmoji: priorityCategory.emoji,
        age: ageText,
        crossStreets,
        slackLink
      });
      blocks.push(markdownSection(requestText));
    }
    const remaining =
      areaRequests.length - VISIBLE_REQUESTS_PER_SUBNEIGHBORHOOD;
    if (remaining > 0) {
      const remainingText = str(
        "slackapp:deliverySummaryPost.neighborhoodFooter"
      );
      blocks.push({
        type: "context",
        elements: [{ type: "mrkdwn", text: remainingText }]
      });
    }
  }
  blocks.push(divider);
  blocks.push({
    type: "context",
    elements: [
      { type: "mrkdwn", text: str("slackapp:deliverySummaryPost.outro") }
    ]
  });
  return blocks;
};

const getCrossStreets = request => {
  const streets = [fields.crossStreetFirst, fields.crossStreetSecond].map(f =>
    request.get(f)
  );
  const streetText = streets.filter(s => s).join(" & ");
  if (!streetText) {
    return str("slackapp:deliverySummaryPost.unknownCrossStreets");
  }
  return streetText;
};

const getSlackLink = request => {
  return "http://test.com";
};

const getAge = request => {
  console.log((new Date() - new Date(request.get(fields.time))) / MS_PER_DAY);
  console.log(
    parseInt((new Date() - new Date(request.get(fields.time))) / MS_PER_DAY)
  );

  return Math.round(
    (new Date() - new Date(request.get(fields.time))) / MS_PER_DAY
  );
};

const getPriorityCategory = age => {
  const getStrings = type => {
    return {
      name: str(`slackapp:deliverySummaryPost.priorities.${type}.name`),
      emoji: str(`slackapp:deliverySummaryPost.priorities.${type}.emoji`)
    };
  };
  if (age > REQUEST_OVERDUE_DAYS) {
    return getStrings("overdue");
  }
  if (age > REQUEST_DRAGGING_DAYS) {
    return getStrings("dragging");
  }
  return getStrings("current");
};

const divider = {
  type: "divider"
};

const markdownSection = text => {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text
    }
  };
};
