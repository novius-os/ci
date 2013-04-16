#!/bin/bash

ROOT=$(pwd)
app=$1
lang=$2

# Init
mkdir generated      2> /dev/null
mkdir generated/$app 2> /dev/null
rm -r generated/$app/$lang  2> /dev/null
rm generated/unused_$lang/$app.po 2> /dev/null

# Read 'po' dir and generate both .po and .php files into the 'lang' directory
cd $ROOT
rm -r lang 2> /dev/null
php gettext.php $lang $3

# Copy translations files into the 'generated' folder
cp lang/* generated/$app -R

# If unused translations were found, put them in an 'unused_*' directory
if [ -f generated/$app/$lang/unused.po ]
then
    mkdir generated/unused_$lang 2> /dev/null
    mv generated/$app/$lang/unused.po generated/unused_$lang/$app.po
fi

# Cleanup
cd $ROOT
rm -r lang
