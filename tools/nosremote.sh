#!/bin/bash

# Execute this script from Novius OS root directory to :
# - add ci and monkey repos
# - add github remote on all repos

ROOT=$(pwd)/

declare -A SUBMODULES

SUBMODULES['novius-os/ci']='ci';
SUBMODULES['novius-os/noviusos_monkey']='local/applications/noviusos_monkey';

##################################
# Create additional repositories #
##################################
for submodule in ${!SUBMODULES[*]}
do
	submodule_dir=${SUBMODULES[$submodule]}
	path=${ROOT}${submodule_dir}

	if [ ! -d $path ]
	then
		echo '-------------------------------------------------------------' # line break
		mkdir $path
		echo "$(git clone git://github.com/$submodule.git $path)"
	fi
done

###############################################
# Add the 'github' remote to every repository #
###############################################
SUBMODULES['novius-os/core']='novius-os';
SUBMODULES['novius-os/noviusos_appwizard']='local/applications/noviusos_appwizard';
SUBMODULES['novius-os/noviusos_blog']='local/applications/noviusos_blog';
SUBMODULES['novius-os/noviusos_blognews']='local/applications/noviusos_blognews';
SUBMODULES['novius-os/noviusos_comments']='local/applications/noviusos_comments';
SUBMODULES['novius-os/noviusos_form']='local/applications/noviusos_form';
SUBMODULES['novius-os/noviusos_news']='local/applications/noviusos_news';
SUBMODULES['novius-os/noviusos_slideshow']='local/applications/noviusos_slideshow';
SUBMODULES['novius-os/noviusos_templates_basic']='local/applications/noviusos_templates_basic';

git remote add github git@github.com:novius-os/novius-os.git

for submodule in ${!SUBMODULES[*]}
do
	submodule_dir=${SUBMODULES[$submodule]}
	path=${ROOT}${submodule_dir}

	if [ -d $path ]
	then
		echo '-------------------------------------------------------------' # line break
		echo $submodule
		cd $path
		echo "$(git remote rm github)"
		echo "$(git remote add github git@github.com:$submodule.git)"
	else
		echo "---------- Skipped $submodule: directory does not exists";
	fi
done

#############################
# Add the 'pre-commit' hook #
#############################

# GIT 1.7.8+
PRE_COMMIT=$ROOT/.git/modules/novius-os/hooks/pre-commit

# GIT 1.7.8-
#PRE_COMMIT=$ROOT/novius-os/.git/hooks/pre-commit

echo "#!/bin/bash

./hooks/minify.sh
" > $PRE_COMMIT

chmod +x $PRE_COMMIT

echo '' # line break
