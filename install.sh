#!/usr/bin/env bash

## First run - clone additional repositories and run npm install in appropriate folders
## Subsequent runs - update everything (assuming no unstaged changes exist) and re-run npm install where appropriate
CURRENTDIR=$(pwd)
ARDEFACT_WEB_FOLDER=$CURRENTDIR/"ardefact_web"
ARDEFACT_API_FOLDER=$CURRENTDIR/"ardefact_api"

echo "--- Updating ardefact_main"
git pull --rebase

if [ ! -d "$ARDEFACT_WEB_FOLDER" ]; then
    # clone web
    git clone git@git.ardefact.com:~/new/ardefact_web.git
else
    # pull changes
    echo "--- Updating $ARDEFACT_WEB_FOLDER from remote server"
    pushd $ARDEFACT_WEB_FOLDER; git pull --rebase
    popd
fi

if [ ! -d "$ARDEFACT_API_FOLDER" ]; then
    # clone api
    git clone git@git.ardefact.com:~/new/ardefact_api.git
else
    # pull changes
    echo "--- Updating $ARDEFACT_API_FOLDER from remote server"
    pushd $ARDEFACT_API_FOLDER; git pull --rebase
    popd
fi

#echo "--- Running npm install in ${ARDEFACT_API_FOLDER}/ardefact-api"
#pushd ./${ARDEFACT_API_FOLDER}/ardefact-api; npm install
