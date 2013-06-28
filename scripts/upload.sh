#! /bin/sh

IMAGESHACK_DEVELOPER_KEY=8ABCDELQ673cd7e375ad15fa94a10c45b9a699f9
export IMAGESHACK_DEVELOPER_KEY

wget http://www.novius-os.org/static/apps/noviusos_templates_basic/img/logo.png -O /tmp/logo-novius-os.png

../vendor/imageshack-upload /tmp/logo-novius-os.png
