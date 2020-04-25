const {
  errorView,
  successView,
  successResponse,
  errorResponse
} = require("~slack/views");
const slackapi = require("~slack/webApi");
const guard = require("~slack/guard");
const { ADMIN_CHANNEL, INTAKE_CHANNEL } = require("~slack/constants");
const { findChannelByName, listMembers } = require("~slack/channels");
const { str } = require("~strings/i18nextWrappers");

editPost.id = "edit_post";
saveEdits.id = "save_post_edit";
deletePost.id = "delete_post";

// Members of these channels can edit messages
const editorsAllowedChannels = [ADMIN_CHANNEL, INTAKE_CHANNEL];

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
  const { message, channel, user } = payload;
  if (!message) {
    return openError(
      payload.trigger_id,
      str(
        "slackapp:editBotPost.modal.error.notAMessage",
        "This shortcut can only be used on messages."
      )
    );
  }

  const botUser = await slackapi.auth.test();
  if (message.bot_id !== botUser.bot_id) {
    return openError(
      payload.trigger_id,
      str(
        "slackapp:editBotPost.modal.error.notBotPost",
        "You can only edit messages posted by the bot."
      )
    );
  }

  const canEdit = await userCanEditMessage(user, message);
  if (!canEdit) {
    return openError(
      payload.trigger_id,
      str(
        "slackapp:editBotPost.modal.error.noPermission",
        "You aren't permitted to edit this message."
      )
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
    return errorResponse(
      `${str(
        "slackapp:editBotPost.modal.error.default",
        `Failed to update message`
      )}: ${e}`
    );
  }
  return successResponse(
    str(
      "slackapp:editBotPost.modal.success.update",
      "The message was successfully updated"
    )
  );
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
      view: errorView(
        `${str(
          "slackapp:editBotPost.modal.error.deletion",
          `Error deleting message`
        )}: ${e}`
      )
    });
  }
  return slackapi.views.update({
    view_id: payload.view.id,
    view: successView(
      str(
        "slackapp:editBotPost.modal.success.deletion",
        "Message successfully deleted"
      )
    )
  });
}

async function userCanEditMessage(user, message) {
  if (message.text.includes(`<@${user.id}>`)) {
    return true;
  }
  for (const channelName of editorsAllowedChannels) {
    /* eslint no-await-in-loop: off */
    const channel = await findChannelByName(channelName);
    if (channel) {
      const [members, _error] = await listMembers(channel.id);
      if (members.includes(user.id)) {
        return true;
      }
    }
  }
  return false;
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
      text: str("slackapp:editBotPost.modal.title", "Edit Post"),
      emoji: true
    },
    submit: {
      type: "plain_text",
      text: str("common:save", "Save"),
      emoji: true
    },
    close: {
      type: "plain_text",
      text: str("common:cancel"),
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
          text: str(
            "slackapp:editBotPost.modal.label.edit",
            "You can edit the post's content:"
          ),
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: str(
            "slackapp:editBotPost.modal.label.deletion",
            "Or, if you'd like you can remove the post entirely:"
          )
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: str(
              "slackapp:editBotPost.modal.button.deletion",
              "Delete Post"
            ),
            emoji: true
          },
          action_id: deletePost.id,
          style: "danger",
          confirm: {
            title: {
              type: "plain_text",
              text: str(
                "slackapp:editBotPost.modal.button.confirm",
                "Are you sure?"
              )
            },
            text: {
              type: "mrkdwn",
              text: str(
                "slackapp:editBotPost.modal.success.button.confirmMessage",
                "The post cannot be un-deleted and any threads will remain."
              )
            },
            confirm: {
              type: "plain_text",
              text: str("slackapp:editBotPost.modal.button.deletion")
            },
            deny: {
              type: "plain_text",
              text: str("common:cancel")
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
  console.log(`Got error: ${message}`);
  return slackapi.views.open({
    trigger_id: triggerId,
    view: errorView(message)
  });
}
