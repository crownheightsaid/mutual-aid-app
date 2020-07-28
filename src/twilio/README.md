this folder holds serverless Assets + Functions that we have deployed via Twilio Runtime.

- functions/phone-message.js runs when someone calls the hotline (plays an .mp3 voicemail from assets folder, asks for dialtone input, and then redirects to the after-input function along with location-based parameters)
- the after-input.js function writes to Airtable with information about the caller and their request
- functions/sms/incoming-sms.js runs when someone texts the hotline, writing the body of their message into Airtable and sending 1 message back (i.e. "we will be in touch with you, thank you")

this folder also holds the required .env variables for the Twilio Runtime environment.

<<<<<<< HEAD
functions are deployed via the twilio serverless toolkit and live on mutual-aid-3223-dev.twil.io

in the Twilio console, in the "Phone Numbers" menu, the dev.twil.io function link is attached as a webhook 

(for example: when an call comes in to our number during our intake pause, the webhook mutual-aid-3223-dev.twil.io/pause runs)

=======
functions are deployed via the twilio serverless toolkit and live on mutual-aid-4526-dev.twil.io
>>>>>>> 69afe5f520c372c7a987a64975e3ba9c5fc51198
- you can test locally with `twilio serverless:start --ngrok=""` 
(then you attach the ngrok links to our dev number in the twilio console to see the functions in action)

- you can deploy with `twilio serverless:deploy`
