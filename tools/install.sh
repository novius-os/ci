#!/bin/bash

dir=$1
if [ -z "$dir" ]
then
	dir="novius-os"
fi
u=$USER
g=`id -g $USER`
sudo mkdir $dir
sudo sh -c "chown $u:$g $dir"
git clone --recursive git://github.com/novius-os/novius-os.git $dir

cd $dir

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
chmod a+w local/data/config
chmod a+w public/cache
chmod a+w public/cache/media
chmod a+w public/media
