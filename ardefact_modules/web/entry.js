import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import $ from 'jquery';
import Cookies from './lib/js.cookie-2.1.4.min';

import LoginForm from './views/login.jsx';
import App from './views/App.jsx';
import ItemListForm from './views/item_list.jsx';

function start() {
  ReactDOM.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById("ardefactBody")
  );

}

function isUserLoggedIn() {
  return Cookies.get('auth_token');
}

function isUserAdmin() {
  return isUserLoggedIn() && Cookies.get('is_admin') === 'true';
}

function clearAllCookies() {
  Cookies.remove('is_admin', {path : ''});
  Cookies.remove('auth_token', {path : ''});
  Cookies.remove('connect.sid', {path : ''});
  Cookies.remove('csrf_token', {path : ''});
}

function logout() {
  console.log("Logging out");
  clearAllCookies();
  window.location = "/";
}

window.ardefact = {
  Cookies         : Cookies,
  isUserLoggedIn  : isUserLoggedIn,
  isUserAdmin     : isUserAdmin,
  clearAllCookies : clearAllCookies,
  start           : start,
  logout          : logout
};


