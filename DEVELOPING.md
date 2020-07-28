This project is a monorepo. The different components are:
- `src/lib`
  - Common functionality that is very low level (constants, minimal Slack API, minimal airtable API, etc)
  - Subpackages can be referenced with a tilde: `require(~airtable/bases)`
- `src/slackapp`
  - Contains HTTP webhooks that Slack will call in response to user action 
- `src/api`
  - HTTP api that this app provides
- `src/twilio`
  - twilio serverless js functions for voice + sms, connecting to airtable; deployed separately  
- `src/webapp`
  - Frontend for the app, built with React. Built to `/public` in project root
- `src/workers`
  - Logic that runs on a schedule (polling airtable etc) 
- `scripts/`
  - One-off scripts for things like backfill. Can also be useful for bulk adding users to slack channels

Each component has it's own DEVELOPING.md for developing locally. You can learn most of it from reading the scripts in `package.json`.


The rest of this file is for app-wide setup for contributing, as well as deploying to non-local environments.
_____________

Quick overview of what we call our environments:

- `local`
  - Running entirely on your machine (except for 3rd party APIs)
  - If 3rd party APIs are hooked up, they are the same as in `staging`
- `staging`
  - Running on heroku, but with different 3p API keys than `prod` 
  - No paid APIs should be connected 
- `prod`
  - Running on heroku, with API keys that grant access to user data and paid services 
_____________

Heroku uses a specific version of node (`12.16.*`). NVM is a tool that lets you easily switch node versions.
We need this since we want our `local` environment to match `staging` and `prod`

If you haven't installed nvm, you can just run these commands:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
# Verify with:
command -v nvm
# If you see a number, nvm is now installed!
# Now install heroku's node version
nvm install 12.16.1
# Use the version
nvm use 12.16.1
```
_____________

After you install the correct version of node, install dependencies:

`npm install`
_____________

When you're ready to submit a pull request, make sure there are no lint errors:

Attempt autofix: `npm run fix`

See errors that couldn't be fixed: `npm run lint`
______________

## Deploying (staging)

You can of course follow [SETUP.md](SETUP.md) to run your own instance. If you are using Crown Heights' credentials
and have been added as a collaborator to staging or prod, you can follow these instructions to deploy to the
existing heroku instance. This example is with the staging app:

```bash
# Clone the app to your machine (if you haven't already)
git clone https://github.com/<your-username>/mutual-aid-app.git

# Login to heroku (should be the account with staging access)
heroku login

# Add the staging repo as a remote
git remote add staging https://git.heroku.com/crownheightsma-staging.git

# Pushing from master branch to staging repo is easy (this will redeploy staging app)
git push staging master

# Pushing from a non-master branch is slightly different
git push staging <branch-name>:master

# See here for more information:
# https://devcenter.heroku.com/articles/multiple-environments#advanced-linking-local-branches-to-remote-apps
```
This slack workspace is by default configured to use the staging env. Try it out!

testcovidslackapp.slack.com
