var BASE_URL = casper.cli.get('base_url'),
    capture_path = casper.cli.get('capture_path') || './',
    test_name = casper.cli.get(0)
    utils = require('utils');

if (casper.cli.get('color-dummy')) {
    casper.options.colorizerType = 'Dummy';
}
if (logLevel = casper.cli.get('log-level')) {
    casper.options.logLevel = logLevel;
}

test_name = test_name.split('/');
test_name = test_name[test_name.length - 1].replace('.js', '');

casper.nosTabSelected = function(title) {
    var tab = casper.getElementInfo('.nos-ostabs-selected .nos-ostabs-label');
    return tab && tab.text == title;
};

casper.nosError = function(message) {
    casper.capture(capture_path + test_name + '-error.png', {
        top: 0,
        left: 0,
        width: 1024,
        height: 768
    });
    casper.test.fail(message);
    casper.test.done();
};

casper.nosLogin = function() {
    casper.thenOpen(BASE_URL + 'admin/nos/login/reset', function login() {
        this.waitForSelector('#login', function() {
            this.test.assertExists('#login form', 'Login form is found');
            this.fill('#login form', {
                email: 'test@test.org',
                password : 'longpassword'
            }, true);
        }, function() {
            this.debugPage();
            this.test.fail("Timeout reached. No login form ?");
        });
    });

    casper.then(function appstab() {
        this.waitForSelector('.nos-ostabs-appstab a', function() {
            this.test.assertExists('.nos-ostabs-appstab a', 'Administration loaded');
            this.click('.nos-ostabs-appstab a');
        }, function() {
            this.debugPage();
            this.test.fail("Timeout reached. No first step ?");
        });
    });
};

casper.start();
casper.viewport(1024, 768);
