#!/bin/bash

if [ -z "$1" ]
  then
    echo "usage: import.sh <lang>"
    echo ""
    echo "This will import .po files from the 'import' folder into Novius OS."
    echo ""
    exit
fi

if [ ! -d import ]
then
    echo "Please create the 'import' folder and put the translations inside."
    echo ""
    exit
fi

ROOT=$(pwd)

# Load applications
source apps.sh

# Convert exported .po files from Pootle to .php languages files used in Novius OS
cd $ROOT/import
php ../convert_po_to_php.php $1

# Delete .po files (only keep .php)
find . -iname "*.po" -exec rm {} \;

# Import the translations files into the applications
for app in ${!APPLICATIONS[*]}
do
    path=${APPLICATIONS[$app]}
    cd $ROOT/import/$app
    echo "$app"

    if [ ! -d $ROOT/import/../../../$path/lang/$1 ]
    then
        echo "  -> creating directory $path/lang/$1"
        mkdir $ROOT/import/../../../$path/lang/$1
    else
        echo "  -> deleting existing translations from $path/lang/$1"
        rm -r -- $ROOT/import/../../../$path/lang/$1
        mkdir $ROOT/import/../../../$path/lang/$1
    fi

    for file in $(find $1 -type f -name '*.php')
    do
		echo "  -> copying $file"
        cp $ROOT/import/$app/$file $ROOT/import/../../../$path/lang/$file
    done
    echo ""
done

# Cleanup
cd $ROOT
