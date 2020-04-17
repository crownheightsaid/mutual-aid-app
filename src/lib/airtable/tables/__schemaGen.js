// You can enter this in the console on:
// https://airtable.com/<base_id>/api/docs
// to generate a close-enough schema

// DONT JUST PASTE IF DOING AN UPDATE!!! Some field names are changed by hand
// Ideally this is just for new tables

/* eslint-disable no-undef */
const camelCase = s =>
  _.snakeCase(s).replace(/_\w/g, function(m) {
    return m[1].toUpperCase();
  });
copy(
  _.mapValues(application.tablesById, table => ({
    tableName: table.name,
    schema: Object.assign(
      ...table.columns.map(col => ({
        [camelCase(col.name)]: col.name,
        ...(col.typeOptions &&
          col.typeOptions.choices && {
            [`${camelCase(col.name)}_options`]: Object.assign(
              ...Object.values(col.typeOptions.choices).map(choice => ({
                [camelCase(choice.name)]: choice.name
              }))
            )
          })
      }))
    )
  }))
);
