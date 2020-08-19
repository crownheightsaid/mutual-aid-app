## Setup Slack App

This setup guide has step-by-step instructions on how to set up a Slack workspace for our Slack apps. We recommend watching the [technical walkthrough video](https://www.youtube.com/watch?v=b1QW5YNtBaM&t=1400s) for clarity.

This guide can also be used to set up a development Slack and app instance.

1. Create a [Slack workspace](https://slack.com/create#email)
1. [Create your app](https://api.slack.com/apps)
1. Click the deploy button below and follow the instructions (you can skip pipeline part)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/crownheightsaid/slack-app)

Get your heroku app URL for slack:
1. When Heroku finishes you can click `View` to go to the URL
    - It should look like `https://app.name.herokuapp.com/`
1. The URL we need would be `https://app.name.herokuapp.com/slack/events`. Save this for later.

Finish setting up your slack app
1. Go your slack app page (`https://api.slack.com/apps/your-app-id`)
1. Make "App Home" tab like this: https://imgur.com/VSnO7iw
1. Go to "Interativity & Shortcuts"
     - Turn on.
     - Add your full `/slack/interactivity` heroku URL to "Request URL"
     - Add the following under Shortcuts:
          -   (Name) Volunteer Sign Up (Callback ID) volunteer-sign-up
          -   (Name) Edit Post (Callback ID) edit_post
          -   (Name) Post Open Request (Location) Global (Callback ID) select_delivery_needed_request
1. Go to "Oauth and Permissions"
     - Add bot scopes: "`commands`", "`users:read`", "`users:read.email`" "`channels:join`" "`channels:read`" "`channels:history`" "`channels:write`" "`chat:write`" "`chat:write.public`" "`groups:history`" "`groups:write`" "`groups:read`" "`im:write`" "`mpim:write`" "`usergroups:write`" "`usergroups:read`" 
1. Go to "Event Subscriptions"
     - Turn on.
     - Add your full `/slack/events` heroku URL to "Request URL"
     - Under "Subscribe to Bot events" add "`app_home_opened`" permission
     - If payments airbase enabled, add "`message.channels`" as well