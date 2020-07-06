this folder holds serverless Assets + Functions that we have deployed via Twilio Runtime.

- functions/pause.js runs when someone calls the hotline (plays an .mp3 voicemail from assets folder, asks for dialtone input, and then redirects to sms/pauses-resources if the caller requests text messages)
- functions/sms/pause-resources.js runs when someone texts the hotline, explaining that the phone line is on pause and offering resources (2 text messages)


this folder also holds the required .env variables for the Twilio Runtime environment.

functions are deployed via the twilio serverless toolkit and live on mutual-aid-3223-dev.twil.io
- you can test locally with `twilio serverless:start --ngrok=""` 
(then you attach the ngrok links to our dev number in the twilio console to see the functions in action)

- you can deploy with `twilio serverless:deploy`
