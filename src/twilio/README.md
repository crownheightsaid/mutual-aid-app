this folder holds serverless Assets + Functions that we have deployed via Twilio Runtime.

functions/pause.js runs when someone calls the mutual aid phone number (plays an .mp3 voicemail from /assets, asks for dialtone input, and sends optional text message); functions/sms/pause-resources.js runs when someone texts the mutual aid phone number, explaining that the phone line is on pause and offering other resources (2 text messages)

this folder also holds the required .env variables for the Twilio Runtime environment.

functions are deployed via the twilio serverless toolkit and live on mutual-aid-3223-dev.twil.io
