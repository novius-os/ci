#! /bin/sh

cd ../../

chmod a+w local/config
chmod a+w local/data/
chmod a+w local/metadata
chmod a+w public/
if [ ! -e public/htdocs/novius-os ]
then
    ln -s ../../novius-os/htdocs public/htdocs/novius-os
fi
chmod a+w public/htdocs/apps
if [ ! -e public/static/novius-os ]
then
    ln -s ../../novius-os/static public/static/novius-os
fi
chmod a+w public/static/apps
chmod a+w logs/fuel
chmod a+w local/cache
chmod a+w local/data/media
chmod a+w local/cache/media
chmod a+w local/cache/fuelphp
chmod a+w local/data/config
chmod a+w public/cache
chmod a+w public/cache/media
chmod a+w public/media

echo "Test suite begin"
if [ "$1" = 'local' ]
then
    echo "Test suite local"
    ci/scripts/test.sh run
    temp=$?
else
    export PHANTOMJS_EXECUTABLE='phantomjs --local-to-remote-url-access=yes --ignore-ssl-errors=yes'
    export DISPLAY=:99.0
    sh -e /etc/init.d/xvfb start

    DISPLAY=:99.0 ci/scripts/test.sh run
    temp=$?
fi
echo "Test suite end"
if [ $temp != 0 ]
then
    IMAGESHACK_DEVELOPER_KEY=8ABCDELQ673cd7e375ad15fa94a10c45b9a699f9
    export IMAGESHACK_DEVELOPER_KEY

    for file in *.png
    do
        echo "Send $file to imageshack"
        ci/vendor/imageshack-upload -i $file
    done
fi
exit $temp
