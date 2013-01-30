
if [ -z "$1" ]
  then
    echo "Please set a lang"
    exit
fi

rm -rf generated
mkdir generated


# 1: path
# 2: app_name (folder)
# 3: lang
# 4: rules.php
function extract_app() {
	rm -rf lang
	
	if [ ! -d $1/$2/lang ]
	then
	    mkdir $1/$2/lang
	fi
	
	if [ ! -d $1/$2/lang/$3 ]
	then
	    mkdir $1/$2/lang/$3
	fi
	
	echo ---------------------------------------- $1/$2 $3 $4
	./gettext.sh $1/$2 $3 $4
	mkdir generated/$2
	cp lang/* generated/$2 -R
	if [ -f generated/$2/$3/unused.po ]
	then
	    if [ ! -d generated/unused_$3 ]
	    then
	        mkdir generated/unused_$3
	    fi

	    mv generated/$2/$3/unused.po generated/unused_$3/$2.po
	fi
	rm -rf lang
}

function extract_core_app() {
	extract_app ../../novius-os/framework/applications $1 $2 app.php
}
function extract_local_app() {
	extract_app ../../local/applications $1 $2 app.php
}

extract_app ../../novius-os framework $1 core.php

extract_core_app noviusos_page $1
extract_core_app noviusos_user $1
extract_core_app noviusos_media $1
extract_core_app noviusos_appmanager $1

extract_local_app noviusos_blognews $1
extract_local_app noviusos_blog $1
extract_local_app noviusos_news $1
extract_local_app noviusos_form $1
extract_local_app noviusos_comments $1
extract_local_app noviusos_appwizard $1
extract_local_app noviusos_templates_basic $1
extract_local_app noviusos_slideshow $1


# Delete .php files (only keep .po)
find generated -iname "*.php" -exec rm {} \;

echo "The files are available in the 'generated' folder"