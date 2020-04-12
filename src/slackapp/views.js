exports.messageErrorResponse = (blockId, msg) => {
  const response = {
    response_action: "errors",
    errors: {}
  };
  response.errors[blockId] = msg;
  return response;
};

const errorView = msg => {
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Error :("
    },
    close: {
      type: "plain_text",
      text: "Close",
      emoji: true
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

const successView = msg => {
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Done!"
    },
    close: {
      type: "plain_text",
      text: "Close",
      emoji: true
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

exports.errorView = errorView;
exports.successView = successView;

exports.errorResponse = msg => {
  return {
    response_action: "update",
    view: errorView(msg)
  };
};

exports.successResponse = msg => {
  return {
    response_action: "update",
    view: successView(msg)
  };
};
