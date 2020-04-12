const {
  errorView,
  successView,
  successResponse,
  errorResponse
} = require("../views");
const slackapi = require("../../slackapi");
const guard = require("../lib/guard");

editPost.id = "edit_post";
saveEdits.id = "save_post_edit";
deletePost.id = "delete_post";

/**
 * Adds a message shortcut to allow users to edit bot messages.
 */
module.exports.register = function register(slackInteractions) {
  // Prompt user with editing dialog
  slackInteractions.action(
    {
      type: "message_action",
      callbackId: editPost.id
    },
    guard(editPost)
  );

  // Handle button that deletes post
  slackInteractions.action(
    {
      actionId: deletePost.id
    },
    guard(deletePost)
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

async function deletePost(payload) {
  const meta = JSON.parse(payload.view.private_metadata);
  try {
    await slackapi.chat.delete({
      channel: meta.message_channel,
      ts: meta.message_ts
    });
  } catch (e) {
    console.error("Error deleting message %O %O", meta, e);
    return slackapi.views.push({
      trigger_id: payload.trigger_id,
      view: errorView(`Error deleting message: ${e}`)
    });
  }
  return slackapi.views.update({
    view_id: payload.view.id,
    view: successView("Message successfully deleted")
  });
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
          text: "You can edit the post's content:",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Or, if you'd like you can remove the post entirely:"
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Delete Post",
            emoji: true
          },
          action_id: deletePost.id,
          style: "danger",
          confirm: {
            title: {
              type: "plain_text",
              text: "Are you sure?"
            },
            text: {
              type: "mrkdwn",
              text: "The post cannot be un-deleted and any threads will remain."
            },
            confirm: {
              type: "plain_text",
              text: "Delete Post"
            },
            deny: {
              type: "plain_text",
              text: "Cancel"
            },
            style: "danger"
          },
          value: "delete_post"
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
