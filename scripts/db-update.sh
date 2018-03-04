#!/usr/bin/env bash

# Run a DB update script
# Author Mitchell Sawatzky

function _runUpdate() {
    echo
    echo "Running $1"
    echo
    mysql --verbose -u root -p -D ewma < $1
    if [ $? -ne 0 ]; then
        echo -e '\n\x1b[31mUpdate failed.\x1b[0m'
    else
        npm run db-update-schema
    fi
    exit 0
}

if [ "$1" == "" ]; then
    rm '/tmp/ewma-_db-update-select' &> /dev/null
    ./scripts/_db-update-select.js
    if [ $? -ne 0 ]; then
        exit 0
    fi

    UPDATE=$(cat /tmp/ewma-_db-update-select 2> /dev/null)
    if [ "$UPDATE" != "" ] && [ -e "$UPDATE" ]; then
        _runUpdate $UPDATE
    fi

    exit 0
elif [ -e "./db/updates/$1" ]; then
    _runUpdate $(realpath "./db/updates/$1")
else
    echo -e "\x1b[31m Cannot run db/updates/$1: does not exist\x1b[0m"
    exit 0
fi
