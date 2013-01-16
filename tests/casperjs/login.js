var BASE_URL = casper.cli.get(1);

casper.start(BASE_URL + 'admin/nos/login/reset', function login() {
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

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
