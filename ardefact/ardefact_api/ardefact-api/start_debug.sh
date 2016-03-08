#!/bin/bash

# use node in case nodemon is not installed
if ! nodemon_loc="$(type -p "nodemon")" || [ -z "$nodemon_loc" ]; then
    pushd ./ardefact_api/ardefact-api; node server.js -d $@
else
    pushd ./ardefact_api/ardefact-api; nodemon server.js -- -d $@
fi

