#!/usr/bin/env bash

ARDEFACT_WEB_FOLDER="ardefact_web"
ARDEFACT_API_FOLDER="ardefact_api"

if [ ! -d "$ARDEFACT_WEB_FOLDER" ]; then
    # clone web
    git clone git@git.ardefact.com:~/new/ardefact_web.git
fi

if [ ! -d "$ARDEFACT_API_FOLDER" ]; then
    # clone api
    git clone git@git.ardefact.com:~/new/ardefact_api.git
fi

pushd ./${ARDEFACT_API_FOLDER}/ardefact-api; npm install