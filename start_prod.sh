#!/bin/bash

# start production instance with minifacation turned on
pushd ./ardefact_api/ardefact-api; node server.js -m -- $@