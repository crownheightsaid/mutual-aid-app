### Running
You can run the worker locally pretty easily:

`npm run local:airtable-sync`

Another thing that can be useful is directly running the handler that gets called when a record is set to "Delivery Needed".
This will resend the notification for the Request with Record ID 1

`node ./src/workers/airtable-sync/newDeliveryRequest.js 1`
