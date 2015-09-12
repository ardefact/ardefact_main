#!/usr/bin/zsh
pushd ./ardefact_web/ardefact-web; npm start &
popd
pushd ./ardefact_api/ardefact-api; nodemon server.js &