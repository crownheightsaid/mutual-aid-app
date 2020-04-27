This repo uses `i18next` to centralize strings and provide multiple languages.

If you want to add a new string, use the `i18next t()` function or the
`str()` wrapper. Make sure to start with a default string, and look around the file
to get an idea how the key should be named.

Once you are calling one of the functions with a default string (i.e. `str("slackapp:newPage.feature.label", "My default label")`)
then you can run `npm run find-new-strings` to add the default string to the JSON.

You can then choose to commit the default message if you feel like it adds to readability.