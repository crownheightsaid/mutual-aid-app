
exports.errorResponse = msg => {
  return {
    response_action: "update",
    view: {
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
    }
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
