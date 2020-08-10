const getParam = (param) => {
  const searchStr = window?.location?.search?.split("?")?.[1] ?? "";
  const params = new URLSearchParams(searchStr);
  return params.get(param) ?? "";
};

export default getParam;
