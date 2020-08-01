
## Environment

Starting the app requires a few environment variables. Folks can reach out for access to those variables in #wg_tech. These should go in `.env` in the repo root. See `app.json` for the description of each env variable.


## Running locally

In the repo root, run 

```
npm install
```

Then, to run the webapp only

```
npm run local:react
```

You can see the app at `localhost:3000`. You will also want to run the API, or most features will not be available. To do so, run

```
npm run local:express
```

Or see `/src/api/DEVELOPING.md` for more details.
