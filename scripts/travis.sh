#! /bin/sh

cd ../../

run ()
{
    if [ "$1" = 'local' ]
    then
        echo "Test suite local"
        ci/scripts/test.sh run
        return $?
    else
        PHANTOMJS_BIN='phantomjs'
        if [ -f /usr/local/phantomjs-1.9.8/phantomjs ]; then
            PHANTOMJS_BIN='/usr/local/phantomjs-1.9.8/phantomjs'
        fi
        $PHANTOMJS_BIN --version

        export PHANTOMJS_EXECUTABLE="$PHANTOMJS_BIN --local-to-remote-url-access=yes --ignore-ssl-errors=yes"
        export DISPLAY=:99.0
        sh -e /etc/init.d/xvfb start

        DISPLAY=:99.0 ci/scripts/test.sh run
        return $?
    fi
}

echo "Test suite begin"
if [ "$1" != 'local' ]
then
cd ci/scripts
./init.sh
cd ../../
fi
run
temp=$?
if [ $temp != 0  -a "$1" != 'local' ]
then
cd ci/scripts
./init.sh
cd ../../
run
temp=$?
fi
echo "Test suite end : $temp"

LOG=logs/fuel/$(date +"%Y")/$(date +"%m")/$(date +"%d").php
if [ -f $LOG ]
then
    temp=1
    cat $LOG
fi

if [ $temp != 0  -a "$1" != 'local' ]
then
    if [ -d screenshot ]
    then
        for file in screenshot/*
        do
            echo "Send $file to imageshack"
            ci/vendor/imgurbash.sh "$file"
        done
    fi
fi
exit $temp
