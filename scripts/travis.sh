#! /bin/sh

cd ../../

chmod a+w local/config
chmod a+w local/data/
chmod a+w local/metadata
chmod a+w public/
ln -s ../../novius-os/htdocs public/htdocs/novius-os
chmod a+w public/htdocs/apps
ln -s ../../novius-os/static public/static/novius-os
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

if [ "$1" = 'local' ]
then
    ci/scripts/test.sh run
else
    export PHANTOMJS_EXECUTABLE='phantomjs --local-to-remote-url-access=yes --ignore-ssl-errors=yes'
    export DISPLAY=:99.0
    sh -e /etc/init.d/xvfb start

    DISPLAY=:99.0 ci/scripts/test.sh run
    temp=$?
fi
if [ $temp != 0 ]
then
    for file in *.png
    do
        IMAGESHACK_DEVELOPER_KEY=8ABCDELQ673cd7e375ad15fa94a10c45b9a699f9
        export IMAGESHACK_DEVELOPER_KEY

        ci/vendor/imageshack-upload -i $file
    done
fi
exit $temp
