Running the React app locally is easy since we use Create React App

`npm run local:react`

You can see the app at `localhost:3000`. Some pages will likely require the API. See `/src/api/DEVELOPING.md` for how to spin that up locally!

## Dependencies

It's easy to run the app, but some features require additional configuration.

### Mapbox API Key

Set the env variable before running the command:

`REACT_APP_MAPBOX_ACCESS_TOKEN={your-free-trial-mapbox-token} npm run local:react`

If you don't want to get a trial token, someone in #tech might have one.
