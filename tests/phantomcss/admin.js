var fs = require('fs');

// CasperJS library
phantom.casperPath = './ci/vendor/casperjs';
phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js');
phantom.injectJs('jquery.js');

// Populate global variables
var casper = require('casper').create();
require('./ci/tests/casperjs/pre.js');
var BASE_URL = casper.cli.get('base_url');

var page = require('webpage').create();
page.evaluate(function() {
    document.body.bgColor = 'white';
});

var css = require('./ci/vendor/phantomcss/phantomcss.js');

css.init({
    screenshotRoot: './ci/tests/phantomcss/screenshots',
	failedComparisonsRoot: './ci/tests/phantomcss/failures'
});

casper.nosError = function nosError(message) {
    this.capture('./ci/tests/phantomcss/screenshots/error.png', {
        top: 0,
        left: 0,
        width: 1024,
        height: 768
    });
    this.die(message);
};

casper.thenOpen(BASE_URL + 'admin/nos/login')
    .then(function(){
        this.waitForSelector('#login', function() {
            css.screenshot('#login');
            this.fill('#login form', {
                email: 'test@test.org',
                password : 'longpassword'
            }, true);
        }, function() {
            this.nosError("Timeout reached. No login form ?");
        });
	});
casper.nosAppsTab();
casper.then(function() {
        this.waitForSelector('a[data-launcher*=noviusos_page]', function() {
            css.screenshot('#noviusos');
        }), (function() {
            this.nosError('Timeout reached. No Webpages launcher ?');
        });
    })
    .then(function() {
        this.click('a[data-launcher*=noviusos_page]');
    })
    .then(function() {
        this.waitFor(function () {
            return this.nosTabSelected('Webpages');
        }, function() {
            css.screenshot('#noviusos');
        }, function() {
            this.nosError('appdesk');
        });
    });
casper.nosAppsTab();
casper.then(function() {
        this.waitForSelector('a[data-launcher*=noviusos_blog]', function() {
            css.screenshot('#noviusos');
        }), (function() {
            this.nosError('Timeout reached. No Blog launcher ?');
        });
    })
    .then(function() {
        this.click('a[data-launcher*=noviusos_blog]');
    })
    .then(function() {
        this.waitFor(function () {
            return this.nosTabSelected('Blog');
        }, function() {
            css.screenshot('#noviusos');
        }, function() {
            this.nosError('appdesk');
        });
    });
casper.then(function(){
        css.compareAll();
    })
    .run(function(){
		phantom.exit(css.getExitStatus());
	});
