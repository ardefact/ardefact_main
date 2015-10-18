#!/usr/bin/env bash

ARDEFACT_WEB_FOLDER="ardefact_web"
ARDEFACT_API_FOLDER="ardefact_api"

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

pushd ./${ARDEFACT_API_FOLDER}/ardefact-api; npm install
