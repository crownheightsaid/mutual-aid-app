const assert = require("assert");
const slackApi = require("../slackapi.js");

const assignToDeliveryBlocks = require("../../translations/en/viewblocks/assignToDelivery.json");

const viewConfig = {
  assignToDelivery: {
    modal_entry_id: "assign-to-delivery",
    blocks: assignToDeliveryBlocks,
    modalConfig: {
      callback_id: "assign-to-delivery-submit",
      title: {
        type: "plain_text",
        text: "Assign to Delivery"
      },
      submit: {
        type: "plain_text",
        text: "Submit"
      }
    }
  }
};
exports.viewConfig = viewConfig;

exports.openViewWithBlocks = async (triggerId, viewName, addedBlocks) => {
  assert(viewConfig[viewName], "Modal (view) not registered.");
  const allBlocks = [];
  const view = viewConfig[viewName];
  allBlocks.push(...view.blocks);
  allBlocks.push(...addedBlocks);

  await slackApi.views.open({
    token: process.env.SLACK_BOT_TOKEN,
    trigger_id: triggerId,
    view: { type: "modal", blocks: allBlocks, ...view.modalConfig }
  });
};

exports.errorModal = msg => {
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Error :("
    },
    blocks: [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: msg
        }
      }
    ]
  };
};
