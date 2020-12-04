#!/bin/bash

USER_ID=$1
USER_NAME="$(id -nu ${USER_ID})"

if [ ! -d "/home/${USER_NAME}" ]; then
    mkhomedir_helper "${USER_NAME}"
fi
