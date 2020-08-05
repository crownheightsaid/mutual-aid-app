const getRequestParam = () => {
  const searchStr = window?.location?.search?.split("?")?.[1] ?? "";
  const params = new URLSearchParams(searchStr);
  return params.get("request") ?? "";
};

export default getRequestParam;
