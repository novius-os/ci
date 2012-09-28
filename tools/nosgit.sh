#!/bin/bash

ROOT=$(pwd)/

declare -A SUBMODULES
# Bundled submodules
SUBMODULES['novius-os/core']='novius-os';
SUBMODULES['novius-os/noviusos_blog']='local/applications/noviusos_blog';
SUBMODULES['novius-os/noviusos_blognews']='local/applications/noviusos_blognews';
SUBMODULES['novius-os/noviusos_comments']='local/applications/noviusos_comments';
SUBMODULES['novius-os/noviusos_news']='local/applications/noviusos_news';
SUBMODULES['novius-os/noviusos_templates_basic']='local/applications/noviusos_templates_basic';

# Additional repositories
SUBMODULES['novius-os/ci']='ci';
SUBMODULES['novius-os/noviusos_monkey']='local/applications/noviusos_monkey';
SUBMODULES['novius-os/noviusos_slideshow']='local/applications/noviusos_slideshow';

echo "Executing git $* on every submodule"

for submodule in ${!SUBMODULES[*]}
do
	submodule_dir=${SUBMODULES[$submodule]}
	path=${ROOT}${submodule_dir}

	if [ -d $path ]
	then
		echo '-------------------------------------------------------------' # retour à la ligne
		echo $submodule
		cd $path
        if [ "$1" = commit ]
        then
            echo "git commit $2 \"$3\""
            git commit $2 "\"$3\""
        else
            echo "git $*"
            sh -c "git $*"
        fi
	else
		echo '-------------------------------------------------------------' # retour à la ligne
		echo "Skipped $submodule: directory does not exists";
	fi
done
echo '' # line break
