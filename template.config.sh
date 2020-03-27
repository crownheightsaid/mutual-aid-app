#!/bin/bash          

# Follow SETUP.md if you want to avoid command line.
# You only need to use this file if you want to setup heroku with the CLI

SLACK_BOT_TOKEN= # Under "Install App" (you should install your app in your test workspace)
SLACK_SIGNING_SECRET= # Under "Basic Information"

## Airtable
AIRTABLE_KEY=
AIRTABLE_BASE=

## Gmail env. See docs/gmail-refresh-token.md
GOOGLE_CLIENT_KEY=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
SYNC_GMAIL=1 # unset or set =0 if you want to disable the in-process gmail sync

## TODO: look into using `declare` or something like `heroku config:set $(xargs <.env)`
heroku config:set SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN SLACK_SIGNING_SECRET=$SLACK_SIGNING_SECRET GOOGLE_CLIENT_KEY=$GOOGLE_CLIENT_KEY GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET GOOGLE_REFRESH_TOKEN=$GOOGLE_REFRESH_TOKEN SYNC_GMAIL=$SYNC_GMAIL AIRTABLE_KEY=$AIRTABLE_KEY AIRTABLE_BASE=$AIRTABLE_BASE