#!/bin/bash

ROOT=$(pwd)

# Load applications
source apps.sh

# Import the translations files into the applications
for app in ${!APPLICATIONS[*]}
do
    path=${APPLICATIONS[$app]}
    echo ""
    echo "$path  `date +%H:%M:%S`"

    app=$(basename $path)
    path=$(dirname $path)

    # Extract translations from the source code (.po files will be generated into the 'po' dir)
    ./gettext.sh ../../$path/$app

    # Read 'po' dir and generate both .po and .php files into the 'generated' directory
    ./extract_lang.sh $app fr
    ./extract_lang.sh $app ja true
    ./extract_lang.sh $app ru true
    ./extract_lang.sh $app ie true
    ./extract_lang.sh $app es true
done

echo ""

# Delete .php files (only keep .po)
find generated -iname "*.php" -exec rm {} \;

# Cleanup
cd $ROOT
rm -r po 2> /dev/null


