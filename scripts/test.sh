#!/bin/sh

DB_HOST='localhost'
DB_NAME='novius_os'
DB_USER='root'
DB_PASSWORD=''
URL='http://novius-os/'
SCREENSHOT=screenshot/
REPORT=report
CASPERJS=ci/vendor/casperjs/bin/casperjs

if [ -f ci/scripts/properties ]
then
    echo "Special properties"
    . ci/scripts/properties
fi

DATE=$(date +"%F-%H-%M-%S")
SCREENSHOTDATE="${SCREENSHOT}${DATE}-"
CASPER_OPTIONS="--fail-fast --direct --log-level=warning --capture_path=$SCREENSHOTDATE --includes=./ci/tests/casperjs/pre.js --base_url=$URL"

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

	sudo rm -rf $REPORT
	sudo rm -rf $SCREENSHOT
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

	echo $CASPER_OPTIONS

	$CASPERJS test ./ci/tests/casperjs/install.js --xunit=$REPORT/casper-install.xml $CASPER_OPTIONS --host='$DB_HOST' --user='$DB_USER' --password='$DB_PASSWORD' --db=$DB_NAME
	temp=$?
	if [ $temp != 0 ]
	then
		return $temp
	else
		if [ "$1" = "wizard" ]
		then
			return $temp
		fi

		$CASPERJS test ./ci/tests/casperjs/appmanager.js --xunit=$REPORT/casper-appmanager.xml $CASPER_OPTIONS
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
		return $temp
	else
		return_code=0

		$CASPERJS test ./ci/tests/casperjs/media.js --xunit=$REPORT/casper-media.xml $CASPER_OPTIONS
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "media" ]
		then
			return $return_code
		fi

		$CASPERJS test ./ci/tests/casperjs/page.js --xunit=$REPORT/casper-page.xml $CASPER_OPTIONS
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "page" ]
		then
			return $return_code
		fi

		$CASPERJS test ./ci/tests/casperjs/blog.js --xunit=$REPORT/casper-blog.xml $CASPER_OPTIONS
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "blog" ]
		then
			return $return_code
		fi

		$CASPERJS test ./ci/tests/casperjs/new-home.js --xunit=$REPORT/casper-new-home.xml $CASPER_OPTIONS
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "new-home" ]
		then
			return $return_code
		fi

		$CASPERJS test ./ci/tests/casperjs/page-del.js --xunit=$REPORT/casper-page-del.xml $CASPER_OPTIONS
		temp=$?
		if [ $temp != 0 ]
		then
			return_code=$temp
		fi

		if [ "$1" = "page-del" ]
		then
			return $return_code
		fi

		$CASPERJS test ./ci/tests/casperjs/media-del.js --xunit=$REPORT/casper-media-del.xml $CASPER_OPTIONS
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

