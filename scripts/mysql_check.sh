#!/bin/bash

# Checks if mysql is running.  If not then send out alert email and attempt to restart it.
# If we were able to restart send success email, otherwise send failure email


ROOT=$ARDEFACT_ROOT/scripts

HOSTNAME="$(hostname)"

$(which service) mysql status
if [ $? -ne 0 ]; then
    printf "To: lev@ardefact.com\nSubject: [AUTO][FAIL] MySQL is down on ${HOSTNAME}\n\n its not running :(((\n I will attempt to restart it" | $ROOT/sendmail.py
    /etc/init.d/mysql start
    if [ $? -ne 0 ]; then
        printf "To: lev@ardefact.com\nSubject: [AUTO][FAIL] Restarting Mysql failed on ${HOSTNAME}\n\n Something must be terribly wrong!" | $ROOT/sendmail.py
    else
        printf "To: lev@ardefact.com\nSubject: [AUTO][SUCCESS] Starting MySQL succeeded on ${HOSTNAME}\n\n Yay!" | $ROOT/sendmail.py
    fi
fi