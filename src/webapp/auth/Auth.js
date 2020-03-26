import axios from "axios";

const SERVER_URL = "https://crownheightsma.herokuapp.com";
axios.defaults.baseURL = SERVER_URL;

export const getToken = () => localStorage.getItem("stoken");
export const saveToken = token => localStorage.setItem("stoken", token);
export const removeToken = () => localStorage.removeItem("stoken");
export const parseToken = () => {
  try {
    const token = getToken();
    if (token) {
      let payload;
      payload = token.split(".")[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    }
  } catch (error) {
    console.error(error);
  }
};

const setAuthHeader = () => ({
  headers: { authorization: `Bearer ${getToken()}` }
});

export const isAuthed = () => {
  const token = parseToken();
  if (token) {
    return token;
  }
  return false;
};

export const signin = payload => axios.post(`/auth/slack`, payload);
export const getUser = userId => axios.get(`/users/${userId}`, setAuthHeader());

export const addArticle = payload =>
  axios.post(`/articles`, payload, setAuthHeader());
export const getArticle = articleId =>
  axios.get(`/articles/${articleId}`, setAuthHeader());
