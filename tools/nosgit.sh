#!/bin/bash

ROOT=$(pwd)/

declare -A SUBMODULES
SUBMODULES['novius-os/core']='novius-os';
SUBMODULES['novius-os/ci']='ci';
SUBMODULES['novius-os/noviusos_blog']='local/applications/noviusos_blog';
SUBMODULES['novius-os/noviusos_blognews']='local/applications/noviusos_blognews';
SUBMODULES['novius-os/noviusos_comments']='local/applications/noviusos_comments';
SUBMODULES['novius-os/noviusos_news']='local/applications/noviusos_news';
SUBMODULES['novius-os/noviusos_monkey']='local/applications/noviusos_monkey';
SUBMODULES['novius-os/noviusos_templates_basic']='local/applications/noviusos_templates_basic';
SUBMODULES['novius-os/noviusos_slideshow']='local/applications/noviusos_slideshow';

CMD="git $*"
echo "Executing \"$CMD\" on every submodule"

for submodule in ${!SUBMODULES[*]}
do
	submodule_dir=${SUBMODULES[$submodule]}
	path=${ROOT}${submodule_dir}

	cd $path

	echo '-------------------------------------------------------------' # retour à la ligne
	echo $submodule
	OUT=$(eval $CMD)
	echo "$OUT"
done
echo '' # retour à la ligne
