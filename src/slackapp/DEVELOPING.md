Running `npm run local:slack`
will start ngrok which will give you a public URL that
will forward traffic to your localhost.

You can then start the express server locally
`npm run local:express` and use the ngrok URL
instead of the heroku URL during the [setup process](../SETUP.md).
Unfortunately, you'll have to change the URLs in slack when you restart ngrok.

______________________________________

`/endpoints/interactivity.js` is a good place to start for understanding this package

### Structure

- `/endpoints`
  - The events and interactivity enpoints that are registered in Slack
  - Both can provide entry points to flows
- `/flows`
  - Each file is a logical flow that a user could go through