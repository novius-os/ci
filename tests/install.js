var BASE_URL = casper.cli.get(1),
    DB_HOST = casper.cli.get(2) || 'localhost',
    DB_USER = casper.cli.get(3) || 'root',
    DB_PASS = casper.cli.get(4) || '',
    DB_NAME = casper.cli.get(5) || 'novius_os';

casper.start(BASE_URL + 'install.php', function step1() {
    this.test.assertExists('form input[type=submit][value="Move on to the next step"]', 'Move on to the next step is found');
    this.click('form input[type=submit][value="Move on to the next step"]');
});

casper.then(function step() {
	this.test.assertTextExists('Configuring the MySQL database', 'Step 2 loaded');
    this.fill('form', {
        hostname: DB_HOST,
        username: DB_USER,
        password: DB_PASS,
        database: DB_NAME
	}, true);
});

casper.then(function step3() {
	this.test.assertTextExists('Create the first administrator account', 'Step 3 loaded');
    this.fill('form', {
		name: 'Test',
		firstname: 'Test',
		email: 'test@test.org',
		password: 'longpassword',
		password_confirmation: 'longpassword'
	}, true);
});

casper.then(function step4() {
	this.test.assertTextExists('Setup languages', 'Step 4 loaded');
	this.click('a[href="admin/"]');
});

casper.then(function login() {
    this.test.assertExists('#login form', 'Login form is found');
    this.fill('#login form', {
		email: 'test@test.org',
		password : 'longpassword'
	}, true);
});

casper.then(function appManager() {
	this.waitForSelector("#nos-ostabs-1", (function() {
		this.test.assertTitle('Applications manager', 'Applications manager is loaded');
	}), (function() {
        this.die("Timeout reached. No Applications manager ?");
        this.exit();
    }));
});

casper.run(function() {
    this.test.done();
});
