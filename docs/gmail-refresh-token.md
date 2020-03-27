## Creating credentials for the Gmail integration

Unfortunately you can't just add your username/password and call it a day. So there are a few steps to get the right credentuals for Gmail. You can use the Google OAuth Playground to get a long-lived refresh token, which lets you authenticate correctly. Ideally the server would run a real OAuth flow, but for a single user that may be overkill. The process involves generating a new OAuth client and manually authenticating it against the current user.

This is all stolen from: https://stackoverflow.com/questions/19766912/how-do-i-authorise-an-app-web-or-installed-without-user-intervention/19766913#19766913i

### Steps

* Go to https://console.developers.google.com/apis/credentials/consent and set up a consent screen. If you need to create a Google Cloud project, the name isn't important. Here you can put the hostname/url of the heroku app in the places where it's asked for.
* For scopes, go to `Add scopes -> manually paste` and set the scopes to `https://mail.google.com/ https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.readonly` 
* Go to https://console.developers.google.com/apis/credentials/oauthclient to set up the client. Once again put in the herkou url/hostname where applicable. The redirect URL will also need to include:
    
    `https://developers.google.com/oauthplayground`

* Save this Client Key / Secret.

* Go to `https://developers.google.com/oauthplayground`. You will need to add the key and secret from above by clicking on `Settings -> Use your own OAuth credentials`
* Paste the following scopes: `https://mail.google.com/ https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/gmail.readonly` into the box next to Authorize APIs, click that and then Exchange authorization code for tokens.
* You made it! Grab the refresh token and hope to never have to go through /this/ process again.

