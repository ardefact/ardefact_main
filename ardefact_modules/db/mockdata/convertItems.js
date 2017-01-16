'use strict';

var _ = require('lodash');

const MockItems = require('./_mockardefacts.json');

function convertItem(old) {
  const new_obj = old;
  new_obj.created_at = {
    location: {
      coordinate: [old.created_at.lng, old.created_at.lat]
    },
    timestamp_ms: 1337
  };

  return new_obj;
}

function convertAll() {
  return _.map(MockItems, convertItem);
}

if (!module.parent) {
  console.log(JSON.stringify(convertAll(), 1, 1));
}