# Developing Slack App

## Set up a development Slack instance
If this is the first time you are developing on the Slack app, please see watch the [technical walkthrough video](https://www.youtube.com/watch?v=b1QW5YNtBaM&t=1400s) section on `Running locally: Slack handlers (+ ngrok intro)`.

The whole process is a bit time consuming, so set aside about an hour for setup. On the bright side, you only have to do it once.
Basically, you need to do three things:

1. set up a test Slack workspace
2. run a Slack app server (see below)
3. set up a test app that points to your Slack app server.

## Run
Start ngrok which will give you a public URL that will forward traffic to your localhost.

```
npm run local:slack
```

Then start the express server locally:

```
npm run local:express
```

Use the ngrok URL instead of the heroku URL during the [setup process](./SETUP.md).
Unfortunately, this ngrok URL updates every time you restart the server, so you'll have to change the URLs in your Slack settings.


## Structure

- `/endpoints`
  - The events and interactivity enpoints that are registered in Slack
  - Both can provide entry points to flows
- `/flows`
  - Each file is a logical flow that a user could go through

`/endpoints/interactivity.js` is a good place to start for understanding this package