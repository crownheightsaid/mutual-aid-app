The [setup guide](SETUP.md) deploys code to heroku. Everytime you want to test a commit, you have to redeploy. See issue: https://github.com/crownheightsaid/slack-app/issues/2

_____________

Heroku uses a specific version of node (`12.16.*`). We have a `.nvmrc` so you can just run `nvm use` after `nvm install 12.16.1` in the `slack-app` directory to switch node versions. If you haven't installed nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
# Verify with:
command -v nvm
# Install heroku's node version
nvm install 12.16.1
# Use the version
nvm use 12.16.1
```
