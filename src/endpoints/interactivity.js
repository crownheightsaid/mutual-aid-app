const volunteerSignUpPath = "volunteer-sign-up";

const listenFinishFollowup = app => {
  app.view(volunteerSignUpPath, async ({ ack, body, view, context }) => {
    ack();
    const formResult = {};
    // Object.values(view.state.values).forEach(formValue => {
    //   const [field, value] = normalizeFormInput(formValue);
    //   formResult[field] = value;
    // });
  });
};

const listenStartFollowup = app => {
  app.action(
    { action_id: volunteerSignUpPath },
    async ({ action, ack, context }) => {
      ack();
      console.log(`Action: ${JSON.stringify(action)}`);
    }
  );
};

export default app => {
  listenStartFollowup(app);
  listenFinishFollowup(app);
};
