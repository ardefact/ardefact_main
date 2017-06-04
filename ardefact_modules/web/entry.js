import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Cookies from './lib/js.cookie-2.1.4.min';

import LoginForm from './views/login.jsx';
import ItemListForm from './views/item_list.jsx';

function start() {

  if (!Cookies.get('auth_token')) {
    ReactDOM.render(
      <LoginForm />,
      document.getElementById("ardefact_body")
    );
  } else {
    /*
     ReactDOM.render(
     <ItemListForm />,
     document.getElementById('ardefact_body')
     );
     */
    window.location = "/itemform.html";
  }
}

function clearAllCookies() {
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
  Cookies: Cookies,
  clearAllCookies: clearAllCookies,
  start: start,
  logout: logout
};


