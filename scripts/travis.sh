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

export PHANTOMJS_EXECUTABLE='phantomjs --local-to-remote-url-access=yes --ignore-ssl-errors=yes'
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start

DISPLAY=:99.0 ci/scripts/test.sh run