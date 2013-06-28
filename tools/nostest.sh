#! /bin/sh

DIR='../../../novius-os'
DB_HOST='localhost'
DB_NAME='novius_os'
DB_USER='root'
DB_PASSWORD=''
URL='http://novius-os/'

if [ -f properties ]
then
    . properties
fi

help ()
{
    echo "Test suite for Novius OS"
    echo ""
    echo "    nostest clone [branch]   - clone Novius OS in specific branch";
    echo "    nostest init             - initialise Novius OS test instance";
    echo "    nostest install [wizard] - runs begin of tests suite, install and appmanager";
    echo "    nostest run [stepname]   - runs complete tests suite";
    echo "    nostest demo             - Novius OS demo test";
}

db ()
{
	$(mysql -h $DB_HOST -u $DB_USER --password=$DB_PASSWORD -e "DROP DATABASE IF EXISTS $DB_NAME;CREATE DATABASE $DB_NAME DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;")
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

init ()
{
	db

	cd $ROOT$DIR

	sudo rm -rf ../report
	sudo rm -rf local/config/development
	sudo rm -f local/config/db.config.php
	sudo rm -f local/config/crypt.config.php
	sudo rm -f local/config/contexts.config.php
	sudo rm -f local/config/contexts.config.php
	sudo rm -rf local/metadata/*
	sudo rm -rf local/cache/fuelphp/*
	sudo rm -rf local/data/media/*
	sudo rm -rf local/cache/media/*
	sudo rm -rf local/cache/fuelphp/*
	sudo rm -rf local/data/config/*
	sudo rm -rf public/cache/media/*
	sudo rm -rf public/media/*

	echo "Instance Novius OS test reseted"
}

install ()
{
	cd $ROOT$DIR

	./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/install.js --xunit=../report/casper-install.xml --fail-fast --direct --log-level=warning --capture_path=../report/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL --host='lnx3.lyon.novius.fr' --user='nos_base' --password='novius' --db=$DB_NAME
	temp=$?
	if [ $temp != 0 ]
	then
		echo $temp
		return $temp
	else
		if [ "$1" = "wizard" ]
		then
			return $temp
		fi

		./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/appmanager.js --xunit=../report/casper-appmanager.xml --fail-fast --direct --log-level=warning --capture_path=../report/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return $temp
		fi
	fi
}

run ()
{
	cd $ROOT$DIR

	wget http://www.novius-os.org/static/apps/noviusos_templates_basic/img/logo.png -O /tmp/logo-novius-os.png

	install
	temp=$?
	if [ $temp != 0 ]
	then
		return $return_code
	else
		return_code=0

		./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/media.js --xunit=../report/casper-media.xml --fail-fast --direct --log-level=warning --capture_path=../report/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "media" ]
		then
			return $return_code
		fi

		./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/page.js --xunit=../report/casper-page.xml --fail-fast --direct --log-level=warning --capture_path=../report/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "page" ]
		then
			return $return_code
		fi

		./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/blog.js --xunit=../report/casper-blog.xml --fail-fast --direct --log-level=warning --capture_path=../report/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "blog" ]
		then
			return $return_code
		fi

		./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/new-home.js --xunit=../report/casper-new-home.xml --fail-fast --direct --log-level=warning --capture_path=../report/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "new-home" ]
		then
			return $return_code
		fi

		./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/page-del.js --xunit=../report/casper-page-del.xml --fail-fast --direct --log-level=warning --capture_path=../report/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "page-del" ]
		then
			return $return_code
		fi

		./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/media-del.js --xunit=../report/casper-media-del.xml --fail-fast --direct --log-level=warning --capture_path=../report/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		return $return_code

	fi
}

demo ()
{
	cd $ROOT$DIR

	./ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/demo.js --xunit=../report/casper-demo.xml --fail-fast --direct --log-level=warning --capture_path=../report/ --includes=./ci/tests/casperjs/pre.js
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
		"init")
			init
			exit $?
		;;
		"install")
			init
			install  $2
			exit $?
		;;
		"run")
			init
			run $2
			exit $?
		;;
		"demo")
			demo
			exit $?
		;;
		*)
			help
		;;
	esac
else
    help
fi

