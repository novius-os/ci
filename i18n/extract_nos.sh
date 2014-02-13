#!/bin/bash

ROOT=$(pwd)

if [ -z "$1" ]
then
    source langs.sh
else
    NOS_LANGS=( $1 )
fi
NOS_LANGS_CONCAT=$(printf ",%s" "${NOS_LANGS[@]}")
NOS_LANGS_CONCAT=${NOS_LANGS_CONCAT:1}


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
    for L in ${NOS_LANGS[@]}; do
        ./extract_lang.sh $app $L true
    done
done

./extract_js.sh $NOS_LANGS_CONCAT

echo ""

# Delete .php files (only keep .po)
find generated -iname "*.php" -exec rm {} \;

# Cleanup
cd $ROOT
rm -r po 2> /dev/null

rm -r zip 2> /dev/null
mkdir zip
for L in ${NOS_LANGS[@]}; do
    mkdir zip/$L
    for app in ${!APPLICATIONS[*]}
    do
        mkdir zip/$L/$app
        mkdir zip/$L/$app/$L
        cp generated/$app/$L/* zip/$L/$app/$L
    done

    mkdir zip/$L/tinymce
    mkdir zip/$L/tinymce/$L
    cp generated/tinymce/$L/* zip/$L/tinymce/$L
done
