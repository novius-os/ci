#!/bin/bash

if [ -d 'novius-os-zip' ]
then
	echo 'Remove novius-os-zip'
    sudo rm -rf novius-os-zip
fi

git clone --recursive git://github.com/novius-os/novius-os.git novius-os-zip/novius-os

if [ -z $1 ]
then
    cd novius-os-zip/novius-os
    BRANCH=`git branch -a 2>/dev/null | grep "^* " | cut -c3- | sed -e "s,/,,g" | sed -e "s,master,,g"`
    cd ..
else
    BRANCH=$1
    cd novius-os-zip/novius-os
    git checkout $1
    git submodule update --recursive
    cd ..
fi

tar cfz novius-os.tar.gz novius-os --exclude .git --exclude .git* --exclude .travis.yml --exclude hooks/ --exclude tests/ --exclude phpunit.xml
rm -rf novius-os
tar xfz novius-os.tar.gz

SLASH_POS=`expr index "$BRANCH" /`

zip -r -q -9 novius-os.${BRANCH:$SLASH_POS}.zip novius-os
rm -f novius-os.tar.gz

