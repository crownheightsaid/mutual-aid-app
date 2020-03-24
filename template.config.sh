#!/bin/bash          

# Rename this file `config.sh` 
# Go to https://api.slack.com/apps/<your_app_id>
SLACK_BOT_TOKEN= # Under "Install App" (you should install your app in your test workspace)
SLACK_BOT_TOKEN= # Under "Basic Information"

# 1. Make "App Home" tab like this: https://imgur.com/VSnO7iw
# 2. Go to "Interativity & Shortcuts"
#      - Turn on. Add a temporary URL to "Request URL"
#      - Add the following under Shortcuts:
#              (Name) Volunteer Sign Up (Callback ID) volunteer-sign-up
# 3. Go to "Oauth and Permissions"
#      - Add bot scopes: "commands", "users:read", "users:read.email"
# 4. Go to "Event Subscriptions"
#      - Turn on. Add a temporary URL to "Request URL"
#      - Under "Subscribe to Bot events" add "app_home_opened" permission
# 5. Run "firebase deploy --only functions" (assuming you already fixed .firebaserc.template)
#      - Add url to "Interactivity & Shortcuts" & "Event Subscriptions" tab

heroku config:set S3_KEY=8N029N81 S3_SECRET=9s83109d3+583493190
