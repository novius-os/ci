#! /bin/sh

DIR='novius-os-test'

help ()
{
    echo "Script Novius OS for test suite "
    echo ""
    echo "    nostest clone [branch]   - clone Novius OS in specific branch";
    echo "    nostest demo             - Novius OS demo test";
    echo "    nostest init             - initialise Novius OS test instance";
    echo "    nostest install [wizard] - runs begin of tests suite, install and appmanager";
    echo "    nostest run [stepname]   - runs complete tests suite";
}

clone ()
{
	cd $ROOT

	sudo mv $DIR/.idea ./
	sudo rm -rf $DIR
	CLONE='git clone'
	if [ -n "$1" ]
	then
		CLONE="$CLONE -b $1"
	fi
	echo "$CLONE --depth 100 --recursive git://github.com/novius-os/novius-os.git $DIR"
	sh -c "$CLONE --depth 100 --recursive git://github.com/novius-os/novius-os.git $DIR"
	cd $DIR
	sh -c "$CLONE git://github.com/novius-os/ci.git"

	mv ../.idea ./
    if [ -f ../properties ]
    then
    	cp ../properties $DIR/ci/script/
    fi

	chmod a+w local/config
	chmod a+w local/data/
	chmod a+w local/metadata
	chmod a+w public/
	ln -s ../../novius-os/htdocs public/htdocs/novius-os
	chmod a+w public/htdocs/apps
	ln -s ../../novius-os/static public/static/novius-os
	chmod a+w public/static/apps
	chmod a+w logs/fuel
	chmod a+w local/cache
	chmod a+w local/data/media
	chmod a+w local/cache/media
	chmod a+w local/cache/fuelphp
	chmod a+w local/data/config
	chmod a+w public/cache
	chmod a+w public/cache/media
	chmod a+w public/media

	db
}

demo ()
{
	cd $ROOT$DIR

	./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/demo.js --xunit=../report/casper-demo.xml --fail-fast --direct --log-level=warning --capture_path=../screenshot/ --includes=./ci/tests/casperjs/pre.js
	return $?
}

ROOT=$(pwd)/

if [ $1 ]
then
    case "$1" in
		"clone")
			clone $2
			exit $?
		;;
		"demo")
			demo
			exit $?
		;;
		"init")
			cd $DIR
			ci/scripts/test.sh run
			exit $?
		;;
		"install")
			cd $DIR
			ci/scripts/test.sh install $2
			exit $?
		;;
		"run")
			cd $DIR
			ci/scripts/test.sh run $2
			exit $?
		;;
		*)
			help
		;;
	esac
else
    help
fi

