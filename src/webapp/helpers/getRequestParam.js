const getRequestParam = () => {
  const searchStr = window.location && window.location.search;
  return searchStr
    .slice(1)
    .split("&")
    .reduce((acc, token) => {
      const matches = token.match(/request=(.*)/);
      return matches ? matches[1] : acc;
    }, "");
};

export default getRequestParam;
