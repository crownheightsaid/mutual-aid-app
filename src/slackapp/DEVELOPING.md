## Setup
Please start at [DEVELOPING.md](/DEVELOPING.md) in the root of this repo for installation and setup.

## Running
Running `npm run local:slack`
will start ngrok which will give you a public URL that
will forward traffic to your localhost.

## Set up a development Slack instance
If this is the first time you are developing on the Slack bot, please see watch the [technical walkthrough video](https://www.youtube.com/watch?v=b1QW5YNtBaM&t=1400s) section on `Running locally: Slack handlers (+ ngrok intro)`.

______________________________________

1. set up a test Slack workspace
2. run a Slack bot server (see below)
3. set up a test app that points to your Slack bot server.

### Structure

- `/endpoints`
  - The events and interactivity enpoints that are registered in Slack
  - Both can provide entry points to flows
- `/flows`
  - Each file is a logical flow that a user could go through