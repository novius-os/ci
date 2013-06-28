#! /bin/sh

ROOT=$(pwd)/
TEST_SCRIPT=$ROOT'test.sh'

export PHANTOMJS_EXECUTABLE='phantomjs --local-to-remote-url-access=yes --ignore-ssl-errors=yes'
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start

DISPLAY=:99.0 $TEST_SCRIPT run