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
        export PHANTOMJS_EXECUTABLE='phantomjs --local-to-remote-url-access=yes --ignore-ssl-errors=yes'
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
        IMAGESHACK_DEVELOPER_KEY=8ABCDELQ673cd7e375ad15fa94a10c45b9a699f9
        export IMAGESHACK_DEVELOPER_KEY

        for file in screenshot/*
        do
            echo "Send $file to imageshack"
            ci/vendor/imageshack-upload -i "$file"
        done
    fi
fi
exit $temp
