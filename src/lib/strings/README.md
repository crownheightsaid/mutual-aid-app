This directory contains strings (aka text) that are used througout the app.
If you forked this repo, you should go through each JSON file in `strings/locales/`
and change any text on the right side of the `:` that you don't like.

_____________________________________________

Anything inside `{{ }}` should be moved as a unit. For instance, if you want to change
the string:

`Thanks to {{- deliveryVolunteer}} for stepping up!`

you shouldn't change `{{- deliveryVolunteer}}`. A valid change might be:

`{{- deliveryVolunteer}} stepped up!`