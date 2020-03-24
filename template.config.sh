#!/bin/bash          

# Follow SETUP.md if you want to avoid command line.
# You only need to use this file if you want to setup heroku with the CLI

SLACK_BOT_TOKEN= # Under "Install App" (you should install your app in your test workspace)
SLACK_SIGNING_SECRET= # Under "Basic Information"

heroku config:set SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN SLACK_SIGNING_SECRET=$SLACK_SIGNING_SECRET
