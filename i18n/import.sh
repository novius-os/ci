
if [ -z "$1" ]
  then
    echo "Please set a lang"
    exit
fi

ROOT=$(pwd)/import

# Load applications
source apps.sh

# Change working directory (do this after loading the applications, or the apps.sh file won't be found)
cd $ROOT

# Convert exported .po files from Pootle to .php languages files used in Novius OS
php ../convert_po_to_php.php

# Delete .po files (only keep .php)
find . -iname "*.po" -exec rm {} \;

# Import the translations files into the applications
for app in ${!APPLICATIONS[*]}
do
    path=${APPLICATIONS[$app]}
    cd $ROOT/$app
    for file in $(find $1 -type f -name '*.php')
    do
        cp $ROOT/$app/$file $ROOT/../../../$path/lang/$file
    done
done
