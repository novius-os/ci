casper.start('http://novius-os-test.gilles.lyon.novius.fr/install.php', function step1() {
    this.test.assertExists('form input[type=submit][value="Move on to the next step"]', 'Move on to the next step is found');
    this.click('form input[type=submit][value="Move on to the next step"]');
});

casper.then(function step() {
	this.test.assertTextExists('Configuring the MySQL database', 'Step 2 loaded');
    this.fill('form', {
		hostname: 'localhost',
		username: 'root',
		password: '',
		database: 'novius_os'
	}, true);
});

casper.then(function step3() {
	this.test.assertTextExists('Create the first administrator account', 'Step 3 loaded');
    this.fill('form', {
		name: 'Test',
		firstname: 'Test',
		email: 'test@test.org',
		password: 'test',
		password_confirmation: 'test'
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
		password : 'test'
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

casper.run();
