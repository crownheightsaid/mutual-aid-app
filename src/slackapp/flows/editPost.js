const { errorView, successResponse, errorResponse } = require("../views");
const slackapi = require("../../slackapi");
const guard = require("../lib/guard")

editPost.id = "edit_post";
saveEdits.id = "save_post_edit";

/**
 * Adds a message shortcut to allow users to edit bot messages.
 */
module.exports.register = function register(slackInteractions) {
  // Prompt uer with editing dialog
  slackInteractions.action(
    {
      type: "message_action",
      callbackId: editPost.id
    },
    guard(editPost)
  );

  // Handles actually updating the post
  slackInteractions.viewSubmission(saveEdits.id, guard(saveEdits));
};

async function editPost(payload) {
  const { message, channel } = payload;
  if (!message) {
    return openError(
      payload.trigger_id,
      "This shortcut can only be used on messages."
    );
  }

  const botUser = await slackapi.auth.test();
  if (message.bot_id !== botUser.bot_id) {
    return openError(
      payload.trigger_id,
      "You can only edit messages posted by the bot."
    );
  }
  const view = await makeEditPostView(payload, message, channel);
  return slackapi.views.open({
    trigger_id: payload.trigger_id,
    view
  });
}

async function saveEdits(payload) {
  const meta = JSON.parse(payload.view.private_metadata);
  const { values } = payload.view.state;
  const content = values.message.message.value;
  try {
    await slackapi.chat.update({
      channel: meta.message_channel,
      ts: meta.message_ts,
      text: content
    });
  } catch (e) {
    console.error("Error updating message %O %O", meta, e);
    return errorResponse(`Failed to update message: ${e}`);
  }
  return successResponse("The message was successfully updated");
}

async function makeEditPostView(payload, message, channel) {
  const meta = {
    message_channel: channel.id,
    message_ts: message.ts
  };
  const editPostBlocks = {
    type: "modal",
    callback_id: saveEdits.id,
    private_metadata: JSON.stringify(meta),
    title: {
      type: "plain_text",
      text: "Edit Post",
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: "Save",
      emoji: true
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true
    },
    blocks: [
      {
        type: "input",
        block_id: "message",
        element: {
          type: "plain_text_input",
          action_id: "message",
          initial_value: message.text,
          multiline: true
        },
        label: {
          type: "plain_text",
          text: "Post",
          emoji: true
        }
      }
    ]
  };
  return editPostBlocks;
}

function openError(triggerId, message) {
  console.log(message);
  return slackapi.views.open({
    trigger_id: triggerId,
    view: errorView(message)
  });
}
