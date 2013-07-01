#! /bin/sh

DB_HOST='localhost'
DB_NAME='novius_os'
DB_USER='root'
DB_PASSWORD=''
URL='http://novius-os/'

if [ -f properties ]
then
    echo "Special properties"
    source properties
fi

help ()
{
    echo "Test suite for Novius OS"
    echo ""
    echo "    test init             - initialise Novius OS test instance";
    echo "    test install [wizard] - runs begin of tests suite, install and appmanager";
    echo "    test run [stepname]   - runs complete tests suite";
}

db ()
{
    echo "Init DB"
	$(mysql -h $DB_HOST -u $DB_USER --password=$DB_PASSWORD -e "DROP DATABASE IF EXISTS $DB_NAME;CREATE DATABASE $DB_NAME DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;")
}

init ()
{
	db

    echo "Instance Novius OS test reset"
	cd $ROOT

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
    echo "Test install begin"
	cd $ROOT

	ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/install.js --xunit=../report/casper-install.xml --fail-fast --direct --log-level=warning --capture_path=../screenshot/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL --host='$DB_HOST' --user='$DB_USER' --password='$DB_PASSWORD' --db=$DB_NAME
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

		ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/appmanager.js --xunit=../report/casper-appmanager.xml --fail-fast --direct --log-level=warning --capture_path=../screenshot/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return $temp
		fi
	fi
}

run ()
{
    echo "Test begin"
	cd $ROOT

	wget http://www.novius-os.org/static/apps/noviusos_templates_basic/img/logo.png -O /tmp/logo-novius-os.png

	install
	temp=$?
	if [ $temp != 0 ]
	then
		return $return_code
	else
		return_code=0

		ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/media.js --xunit=../report/casper-media.xml --fail-fast --direct --log-level=warning --capture_path=../screenshot/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "media" ]
		then
			return $return_code
		fi

		ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/page.js --xunit=../report/casper-page.xml --fail-fast --direct --log-level=warning --capture_path=../screenshot/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "page" ]
		then
			return $return_code
		fi

		ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/blog.js --xunit=../report/casper-blog.xml --fail-fast --direct --log-level=warning --capture_path=../screenshot/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "blog" ]
		then
			return $return_code
		fi

		ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/new-home.js --xunit=../report/casper-new-home.xml --fail-fast --direct --log-level=warning --capture_path=../screenshot/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "new-home" ]
		then
			return $return_code
		fi

		ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/page-del.js --xunit=../report/casper-page-del.xml --fail-fast --direct --log-level=warning --capture_path=../screenshot/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "page-del" ]
		then
			return $return_code
		fi

		ci/vendor/casperjs/bin/casperjs test ./ci/tests/casperjs/media-del.js --xunit=../report/casper-media-del.xml --fail-fast --direct --log-level=warning --capture_path=../screenshot/ --includes=./ci/tests/casperjs/pre.js --base_url=$URL
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		return $return_code

	fi
}

ROOT=$(pwd)/

if [ $1 ]
then
    case "$1" in
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
		*)
			help
		;;
	esac
else
    help
fi

