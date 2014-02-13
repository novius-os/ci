#!/bin/bash

ROOT=$(pwd)

if [ -z "$1" ]
then
    echo "usage: extract.sh <application_path> <lang>"
    echo ""
    echo "This script extracts translations from an application into the 'generated' directory."
    echo ""
    exit
fi

if [ ! -d $ROOT/$application_path ]
then
    echo "Directory '$ROOT/$application_path' not found"
    echo ""
    exit
fi

if [ -z "$2" ]
then
    echo "Please provide a lang"
    echo ""
    exit
fi

application_path=$1
lang=$2

# Extract translations from the source code (.po files will be generated into the 'po' dir)
cd $ROOT
./gettext.sh $application_path

# Read 'po' dir and generate both .po and .php files into the 'generated' directory
cd $ROOT
./extract_lang.sh $(basename $application_path) $lang true

# Cleanup
cd $ROOT
rm -r po 2> /dev/null
