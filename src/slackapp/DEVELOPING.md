Coming soon!

Running the slack app locally is more difficult because it needs to
expose a routable IP address.

For now, you can follow [SETUP.md](../SETUP.md) to create your own app,
or ask for access to Crown Heights' staging app and follow the root level
[DEVELOPING.md](../DEVELOPING.md) instructions.

______________________________________

`/endpoints/interactivity.js` is a good place to start

### Structure

- `/endpoints`
  - The events and interactivity enpoints that are registered in Slack
  - Both can provide entry points to flows
- `/flows`
  - Each file is a logical flow that a user could go through