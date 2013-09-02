#!/bin/bash

# This script will generate a novius-os-zip subdirectory
# It will contains a novius-os.branch.zip

MY_PATH="`dirname \"$0\"`"              # relative
MY_PATH="`( cd \"$MY_PATH\" && pwd )`"  # absolutized and normalized

if [ -d 'novius-os-zip' ]
then
	echo 'Remove novius-os-zip'
    sudo rm -rf novius-os-zip
fi

CLONE='git clone'
if [ -n "$1" ]
then
    BRANCH=$1
    CLONE="$CLONE -b $1"
fi
sh -c "$CLONE --depth 100 --recursive git://github.com/novius-os/novius-os.git novius-os-zip/novius-os"

if [ -z $BRANCH ]
then
    cd novius-os-zip/novius-os
    BRANCH=`git branch -a 2>/dev/null | grep "^* " | cut -c3- | sed -e "s,/,,g" | sed -e "s,master,,g"`
    cd ..
else
    BRANCH=$1
    cd novius-os-zip
fi

tar cfz novius-os.tar.gz novius-os --exclude-from=$MY_PATH/exclude_zip.txt
rm -rf novius-os
tar xfz novius-os.tar.gz

SLASH_POS=`expr index "$BRANCH" /`

zip -r -q -9 novius-os.${BRANCH:$SLASH_POS}.zip novius-os
rm -f novius-os.tar.gz

