#!/bin/bash

if [ -z "$1" ]
  then
    echo "usage: import_js.sh <lang>"
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

# Convert exported .po files from Pootle to .php languages files used in Novius OS
cd $ROOT/import/
php ../convert_po_to_js.php $1

for file in ./tinymce/$1/*.js
do
    echo "  -> copying $file"
    if [ $file = "./tinymce/$1/theme.js" ]
    then
        cp $ROOT/import/$file $ROOT/import/../../../novius-os/static/admin/vendor/tinymce/themes/nos/langs/$1.js
    else
        APP=${file/.js/}
        APP=${APP/.\/tinymce\/$1\//}
        if [ $APP != ${APP/_dlg/} ]
        then
            APP=${APP/_dlg/}
            TARGET=$1"_dlg"
        fi
        cp $ROOT/import/$file $ROOT/import/../../../novius-os/static/admin/vendor/tinymce/plugins/$APP/langs/$TARGET.js
    fi
    echo "trouvé $file";
done

# Cleanup
cd $ROOT
