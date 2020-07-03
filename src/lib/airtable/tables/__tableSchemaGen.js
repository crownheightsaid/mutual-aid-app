// You can enter this in the console on:
// https://airtable.com/<base_id>/api/docs
// to generate an object containing a fields mapping object.

// For example, with the default `Requests` table,
// running this script in the console as above will copy something like:
// {
//    fieldName: "Field name",
//    myWeirdFieldName: "my Weird field NAME",
//    ...
// }
// to  your clipboard.

// Ideally this is done once for a new airtable table
// Because this script isn't perfect and field names can be long,
// you should go through and normalize field accessors manually.

// Updates after the initial table creation should probably be
// done manually. This could still be useful for grabbing long
// select-field options as JSON.

/* eslint-disable no-undef */
tableNameToGenerate = "Requests";
camelCase = (s) =>
  _.snakeCase(s).replace(/_\w/g, (m) => {
    return m[1].toUpperCase();
  });
copy(
  Object.values(application.tablesById)
    .filter((table) => table.name === tableNameToGenerate)
    .map((table) =>
      Object.assign(
        ...table.columns.map((col) => ({
          [camelCase(col.name)]: col.name,
          ...(col.typeOptions &&
            col.typeOptions.choices && {
              [`${camelCase(col.name)}_options`]: Object.assign(
                ...Object.values(col.typeOptions.choices).map((choice) => ({
                  [camelCase(choice.name)]: choice.name,
                }))
              ),
            }),
        }))
      )
    )[0] ||
    "Table with that name not found. Make sure you are in the correct base."
);
