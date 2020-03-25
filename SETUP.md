Setup Slack workspace and create an app (if you're contributing, this serves as a development workspace):
1. Create a [Slack workspace](https://slack.com/create#email)
1. [Create your app](https://api.slack.com/apps)
1. Click the deploy button below and follow the instructions (you can skip pipeline part)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/crownheightsaid/slack-app)

Get your heroku app URL for slack:
1. When Heroku finishes you can click `View` to go to the URL
    - It should look like https://app.name.herokuapp.com/
1. The URL we need would be https://app.name.herokuapp.com/slack/events

Finish setting up your slack app
1. Go your slack app page (https://api.slack.com/apps/your-app-id)
1. Make "App Home" tab like this: https://imgur.com/VSnO7iw
1. Go to "Interativity & Shortcuts"
     - Turn on.
     - Add your full /slack/events heroku URL to "Request URL"
     - Add the following under Shortcuts:
             (Name) Volunteer Sign Up (Callback ID) volunteer-sign-up
1. Go to "Oauth and Permissions"
     - Add bot scopes: "commands", "users:read", "users:read.email"
1. Go to "Event Subscriptions"
     - Turn on.
     - Add your full /slack/events heroku URL to "Request URL"
     - Under "Subscribe to Bot events" add "app_home_opened" permission
