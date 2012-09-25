var BASE_URL = casper.cli.get(1),
    DB_HOST = casper.cli.get(2) || 'localhost',
    DB_USER = casper.cli.get(3) || 'root',
    DB_PASS = casper.cli.get(4) || '',
    DB_NAME = casper.cli.get(5) || 'novius_os';

casper.start(BASE_URL + 'install.php', function step1() {
    this.waitForSelector('form input[type=submit][value="Move on to the next step"]', (function() {
        this.test.assertExists('form input[type=submit][value="Move on to the next step"]', 'Move on to the next step is found');
        this.click('form input[type=submit][value="Move on to the next step"]');
    }), (function() {
        this.debugPage();
        this.test.fail("Timeout reached. No first step ?");
        this.test.done();
    }));
});

casper.then(function step2() {
    this.waitForSelector('form', (function() {
        this.test.assertTextExists('Configuring the MySQL database', 'Step 2 loaded');
        this.fill('form', {
            hostname: DB_HOST,
            username: DB_USER,
            password: DB_PASS,
            database: DB_NAME
        }, true);
    }), (function() {
        this.debugPage();
        this.test.fail("Timeout reached. No second step ?");
        this.test.done();
    }));
});

casper.then(function step3() {
    this.waitForSelector('form', (function() {
        this.test.assertTextExists('Create the first administrator account', 'Step 3 loaded');
        this.fill('form', {
            name: 'Test',
            firstname: 'Test',
            email: 'test@test.org',
            password: 'test',
            password_confirmation: 'test'
        }, true);
    }), (function() {
        this.debugPage();
        this.test.fail("Timeout reached. No third step ?");
        this.test.done();
    }));
});

casper.then(function step4() {
    this.waitForSelector('a[href="admin/"]', (function() {
        this.test.assertTextExists('Setup languages', 'Step 4 loaded');
        this.click('a[href="admin/"]');
    }), (function() {
        this.debugPage();
        this.test.fail("Timeout reached. No fourth step ?");
        this.test.done();
    }));
});

casper.then(function login() {
    this.waitForSelector('#login', (function() {
        this.test.assertExists('#login form', 'Login form is found');
        this.fill('#login form', {
            email: 'test@test.org',
            password : 'test'
        }, true);
    }), (function() {
        this.debugPage();
        this.test.fail("Timeout reached. No login form ?");
        this.test.done();
    }));
});

casper.then(function appManager() {
	this.waitForSelector("#nos-ostabs-1", (function() {
		this.test.assertTitle('Applications manager', 'Applications manager is loaded');
	}), (function() {
        this.debugPage();
        this.test.fail("Timeout reached. No Applications manager ?");
        this.test.done();
    }));
});

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});