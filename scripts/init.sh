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
