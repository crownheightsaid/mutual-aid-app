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

exports.errorResponse = msg => {
  return {
    response_action: "update",
    view: errorView(msg)
  };
};

exports.successResponse = msg => {
  return {
    response_action: "update",
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "Done!"
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
    }
  };
};
