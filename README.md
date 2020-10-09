## Development

To contribute to this project, please first register as a volunteer for CHMA [here](https://crownheightsmutualaid.com/volunteer/).
Make sure to check **Technology** under **Working Groups** so we can get in touch with you.

**Once you have access to the CHMA Slack, please see [DEVELOPING.md](DEVELOPING.md) to start contributing!**
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
1. **Web app** - Supports:
    1. A map that shows open requests
    1. A tool for looking up cross streets + neighborhood zone (not provided) for an address
1. **Reimbursment system** - Separate Airtable base that is used to track reimbursements

_____________________________________________________________________________________________________

## Moved sections
- [Setting up Slack app](./src/slackapp/SETUP.md)

