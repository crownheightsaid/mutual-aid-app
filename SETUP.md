[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Setup slack app backend:
1. 

Setup Slack workspace with your app from above:
1. Create a [Slack workspace](https://slack.com/create#email)
1. [Create your app](https://api.slack.com/apps) for development
1. Run `./config.sh` or add 
1. Make "App Home" tab like this: https://imgur.com/VSnO7iw
1. Go to "Interativity & Shortcuts"
     - Turn on. Add a temporary URL to "Request URL"
     - Add the following under Shortcuts:
             (Name) Volunteer Sign Up (Callback ID) volunteer-sign-up
1. Go to "Oauth and Permissions"
     - Add bot scopes: "commands", "users:read", "users:read.email"
1. Go to "Event Subscriptions"
     - Turn on. Add a temporary URL to "Request URL"
     - Under "Subscribe to Bot events" add "app_home_opened" permission

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
