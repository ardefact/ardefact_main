#!/usr/bin/env bash

# use node in case nodemon is not installed
if ! nodemon_loc="$(type -p "nodemon")" || [ -z "$nodemon_loc" ]; then
    node server.js -d $@
else
    #nodemon server.js -- -d $@
    node server.js -d $@
fi

