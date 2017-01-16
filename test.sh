#!/usr/bin/env bash

CURRENT_DIR=${PWD}
MOCHA=node_modules/mocha/bin/mocha

export NODE_PATH=$CURRENT_DIR/ardefact_modules
echo $NODE_PATH

$MOCHA --recursive ardefact_modules/config/test/*
$MOCHA --recursive ardefact_modules/db/test/*
$MOCHA --recursive ardefact_modules/json_schema/test/*
$MOCHA --recursive ardefact_modules/rest/test/*
