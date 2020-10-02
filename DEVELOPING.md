# Developing
If you are new to contributing, please start here. This guide will cover setting up for any of our apps and should be read before delving into the specifics of each app.

## Table of contents
- [Before you start](#Before-you-start)
- [Directory structure](#Directory-structure)
- [Environments](#Environments)
- [Set up environment variables](#Set-up-environment-variables)
- [Managing Node.js versions](#Managing-Node.js-versions)
- [Mock data](#Mock-data)
- [Running apps](#Running-apps)
- [Linting](#Linting)
- [Testing](#Testing)
- [Submitting your contributions](#Submitting-your-contributions)
- [Deploying](#Deploying)

## Before you start
**IMPORTANT: Do not skip this step.**

To avoid getting blocked, please request the following to [#wg_tech](https://crownheightsmutualaid.slack.com/archives/C010AUQ6DFD) on Slack:

> Hi, I am setting up the mutual-aid-app for local development.
> Can I get permissions for Github, staging Heroku and Airtable?
> My github username is <username> and my email address is <email>

You should get invites for three things:
- This Github repo
- CHMA staging heroku instance
- Staging airtable

One of our working group leads will get you set up. Please make sure to accept invitations within 24 hours to prevent them from expiring.

## Directory structure
This project is a monorepo. The different apps and directories are:
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

Each directory has it's own `DEVELOPING.md` for developing locally. You can also look at `scripts` in `package.json` to get an idea of how to run each app.

The rest of this file is for app-wide setup for contributing, as well as deploying to non-local environments.
_____________

We have three types of environments:

- `local`
  - Running entirely on your machine (except for 3rd party APIs)
  - If 3rd party APIs are hooked up, they are the same as in `staging`
- `staging`
  - staging Airtable data
  - Running on heroku, but with different 3rd party API keys than `prod`
  - No paid APIs should be connected
- `prod`
  - live Airtable data
  - Running on heroku, with API keys that grant access to user data and paid services 
_____________

## Clone this repo
First, you will want a copy of this repo on your computer.

```
git clone https://github.com/crownheightsaid/mutual-aid-app.git
cd mutual-aid-app
```

## Set up environment variables

Before you can start running any of the apps locally, you will need to set up environment variables. You can find them on the [staging Heroku](https://dashboard.heroku.com/apps/crownheightsma-staging/settings) under 'Config Vars'.

Add them in a file named `.env` in the root directory. You can copy it from `.env.example`.

See `app.json` for the definition of each environment variable. You may not need all variables to get started, depending on which part of the app you are working on, but starting with the ones in `.env.example` is a good start.

## Managing Node.js versions

When developing, we want the version of Node.js in our `local` environment to match `staging` and `prod`, which is `12.16.*` as per Heroku's setup.

If you don't already have a version manager, we recommend nvm, a tool that lets you easily switch Node.js versions.


### Installing NVM

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

```
npm install
```

## Mock data
We use Airtable as our main data source. If you set up your environment variables right, your apps should automatically start pulling data from our [staging Airtable](https://airtable.com/tblwLlM3yRmIxCYDB/viwbYLZKipJno7jqs), which you should also have access to if you requested it in the [first step](#before-you-start). Feel free to add test data to that Airtable instance.

## Running apps
All the instructions so far are for general setup for any of the apps in this repo. More likely than not, you will be working on one or two apps only.

If you run into any issues, it is usually due to missing environment variables, so please check those.

### API
More details in [./src/api/DEVELOPING.md](./src/api/DEVELOPING.md)

```
npm run local:express
```

The server is up when you see `Mutual Aid app listening on 5000!`

### Slack bot
Setting up development for the Slack bot is more involved because you have to set up a test Slack app. Please see [./src/slackapp/DEVELOPING.md](./src/slackapp/DEVELOPING.md)

### Web app

To run the webapp, you will also need to run the API server
```
npm run local:react
npm run local:express
```

Visiting [http://localhost:3000/delivery-needed](http://localhost:3000/delivery-needed) should show you a delivery requests map.

More details in [./src/webapp/DEVELOPING.md](./src/webapp/DEVELOPING.md)

### Twilio
Please see [./src/twilio/README.md](./src/twilio/README.md)

## Linting

When you're ready to submit a pull request, make sure there are no lint errors buy running

```
npm run lint
```

To autofix errors that can be autofixed, you can run

```
npm run fix
```

## Testing

This whole repo is severely untested as we prioritized getting to production early in CHMA's existence.

When you're ready to submit a pull request, make sure there are no lint errors:

Attempt autofix: `npm run fix`

See errors that couldn't be fixed: `npm run lint`
______________

### Picking up an issue
You can see our open issues at https://github.com/crownheightsaid/mutual-aid-app/issues. Good first issues will be tagged as such. If you are unsure what to work on, please reach out in [#wg_tech](https://crownheightsmutualaid.slack.com/archives/C010AUQ6DFD)  and we will help you prioritize issues.

Once you have collaborator permissions on Github, **please assign yourself to any issues you are picking up**! This is important to prevent overlapping work and so that you can subscribe to any updates to an issue.

### Branching
Once you have collaborator permissions on Github, you should be able to create and push branches from this repo. This approach is preferred over forking the repo. Please use descriptive branch names.

```
## make a new branch
git checkout -b new_feature

## push branch to this repo
git push origin new_feature
```

### Opening a Pull Request
Once your PR is ready, open a Pull Request against master and post it in [#wg_tech](https://crownheightsmutualaid.slack.com/archives/C010AUQ6DFD)  for reviews. Once it is approved, one of the tech leads will merge it to master and deploy at the next opportunity.
Please link the issue it will close and include a detailed description of changes.

## Deploying

### Staging
Deploying to staging is not always necessary for shipping to prod, but can be helpful to verify integration. We only have one staging environment,
so please post in #wg_tech if you are planning to use it. We also deploy to staging before production for testing.

If you are using Crown Heights' credentials and have been added as a collaborator to staging or prod, you can follow these instructions to deploy to the
existing heroku instance. This example is with our staging app named `crownheightsma-staging`:

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

To test Slack integrations on staging, we have a [workspace](testcovidslackapp.slack.com
) configured to use the staging env. Please ask in #wg_tech for an invitation to that Slack.

### Production
To deploy to production, you will need access to the production Heroku account. Deployment is the same as staging, but the Heroku app name is `crownheightsma` instead of `crownheightsma-staging`. Currently, deploying to prod takes the app down for a few minutes, so please avoid deploying during peak hours 10am-6pm.

## Help
If you run into any issues, please post it in [#wg_tech](https://crownheightsmutualaid.slack.com/archives/C010AUQ6DFD) on Slack and we will do our best to help you out. Please include screenshots and any error messages for a quicker response.
