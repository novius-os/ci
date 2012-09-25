casper.start('http://novius-os/install.php', function step1() {
    this.waitForSelector('form input[type=submit][value="Move on to the next step"]', (function() {
        this.test.assertExists('form input[type=submit][value="Move on to the next step"]', 'Move on to the next step is found');
        this.click('form input[type=submit][value="Move on to the next step"]');
    }), (function() {
        this.debugPage();
        this.die("Timeout reached. No first step ?");
        this.exit();
    }));
});

casper.then(function step2() {
    this.waitForSelector('form', (function() {
        this.test.assertTextExists('Configuring the MySQL database', 'Step 2 loaded');
        this.fill('form', {
            hostname: 'localhost',
            username: 'root',
            password: '',
            database: 'novius_os'
        }, true);
    }), (function() {
        this.debugPage();
        this.die("Timeout reached. No second step ?");
        this.exit();
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
        this.die("Timeout reached. No third step ?");
        this.exit();
    }));
});

casper.then(function step4() {
    this.waitForSelector('a[href="admin/"]', (function() {
        this.test.assertTextExists('Setup languages', 'Step 4 loaded');
        this.click('a[href="admin/"]');
    }), (function() {
        this.debugPage();
        this.die("Timeout reached. No fourth step ?");
        this.exit();
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
        this.die("Timeout reached. No login form ?");
        this.exit();
    }));
});

casper.then(function appManager() {
	this.waitForSelector("#nos-ostabs-1", (function() {
		this.test.assertTitle('Applications manager', 'Applications manager is loaded');
	}), (function() {
        this.debugPage();
        this.die("Timeout reached. No Applications manager ?");
        this.exit();
    }));
});

this.test.done();
