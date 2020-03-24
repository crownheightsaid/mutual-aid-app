const normalizeFormInput = blockMapping => {
  if (Object.keys(blockMapping).length !== 1) {
    console.warn("More than one entry in input field.");
  }
  const fieldName = Object.keys(blockMapping)[0];
  const fieldResult = blockMapping[fieldName];
  if (fieldResult.type === "plain_text_input") {
    return [fieldName, fieldResult.value];
  }
  if (fieldResult.type === "static_select") {
    return [fieldName, fieldResult.selected_option.value];
  }
  if (fieldResult.type === "multi_static_select") {
    return [fieldName, fieldResult.selected_options.map(val => val.value)];
  }

  // TODO log and solve
  return [fieldName, null];
};

exports.normalizeFormInput = normalizeFormInput;
