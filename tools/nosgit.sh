#!/bin/bash

# Add this script in your personnal directory
# Rename it if you want and give it execution right
# Edit your .bashrc
# Add this line at the end of file :
# alias nosgit='~/nosgit.sh'
# Now, in Novius OS root directory you can use nosgit command for execute git command on all submodules

ROOT=$(pwd)/

declare -A SUBMODULES
# Bundled submodules
SUBMODULES['novius-os/core']='novius-os';
SUBMODULES['novius-os/noviusos_appwizard']='local/applications/noviusos_appwizard';
SUBMODULES['novius-os/noviusos_blog']='local/applications/noviusos_blog';
SUBMODULES['novius-os/noviusos_blognews']='local/applications/noviusos_blognews';
SUBMODULES['novius-os/noviusos_comments']='local/applications/noviusos_comments';
SUBMODULES['novius-os/noviusos_form']='local/applications/noviusos_form';
SUBMODULES['novius-os/noviusos_news']='local/applications/noviusos_news';
SUBMODULES['novius-os/noviusos_slideshow']='local/applications/noviusos_slideshow';
SUBMODULES['novius-os/noviusos_templates_basic']='local/applications/noviusos_templates_basic';
SUBMODULES['novius-os/noviusos_template_bootstrap']='local/applications/noviusos_template_bootstrap';

# Additional repositories
SUBMODULES['novius-os/ci']='ci';
SUBMODULES['novius-os/noviusos_monkey']='local/applications/noviusos_monkey';

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
