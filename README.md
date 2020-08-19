Go to [developing](DEVELOPING.md) if you want to contribute! Most folders contain a DEVELOPING guide as well.
_________________________________________________________________________

## Overview 

[Functionality walkthrough](https://youtube.com/watch?v=SyrOdZVb-zw) (dated May 17, 2020)  
[Technical walkthrough](https://youtube.com/watch?v=b1QW5YNtBaM) (dated May 17, 2020)

This is an app for doing mutual aid related tasks! It is based on airtable, and requires
certain airtable fields. If you already have an airtable, or need help setting this up, feel
free to reach out!

**Note:** this app is severly undertested! it's used in 'production', but development is rapid.
YMMV.

The app can provide the following (all optional):
1. **Twilio** - Support for a phone hotline that adds to airtable
1. **Slack Bot** - Support for a slack bot that can:
    1. Aid in posting info from airtable to slack
    1. Aid in marking airtable from slack
1. **Web page** - Supports:
    1. A map that shows open requests
    1. A tool for looking up cross streets + neighborhood zone (not provided) for an address
1. **Reimbursment system** - Separate Airtable base that is used to track reimbursements

_____________________________________________________________________________________________________

## Slack-only Setup 


Setup Slack workspace and create an app (if you're contributing, this serves as a development workspace):
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
