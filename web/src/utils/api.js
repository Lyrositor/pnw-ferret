import axios from 'axios';
import queryString from 'querystring';

const API = 'http://localhost:8084';

export default {initialize, login, logout, register, alliance, alliances, nation, nations, password};

export function initialize () {
  return callApi('initialize', {});
}

export function login (nationId, password) {
  return callApi('login', {nationId, password});
}

export function logout () {
  return callApi('logout', {});
}

export function register (nationId) {
  return callApi('register', {nationId});
}

export function alliance (id) {
  return callApi('alliance', {id});
}

export function alliances () {
  return callApi('alliances', {});
}

export function nation (id) {
  return callApi('nation', {id});
}

export function nations () {
  return callApi('nations', {});
}

export function password (password) {
  return callApi('password', {password});
}

function callApi (path, params) {
  return axios.post(`${API}/${path}`, queryString.stringify(params), {
    withCredentials: true
  }).then((response) => response.data);
}
