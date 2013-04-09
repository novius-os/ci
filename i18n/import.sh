
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
    echo "$app"
    for file in $(find $1 -type f -name '*.php')
    do
		if [ ! -d $ROOT/../../../$path/lang/$1 ]
		then
		    echo "  -> creating directory $path/lang/$1"
			mkdir $ROOT/../../../$path/lang/$1
		fi
		echo "  -> copying $file"
        cp $ROOT/$app/$file $ROOT/../../../$path/lang/$file
    done
    echo ""
done
