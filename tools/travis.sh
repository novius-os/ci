#! /bin/sh

ROOT=$(pwd)/

export PHANTOMJS_EXECUTABLE='phantomjs --local-to-remote-url-access=yes --ignore-ssl-errors=yes'
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start

DISPLAY=:99.0 ${ROOT}nostest.sh run