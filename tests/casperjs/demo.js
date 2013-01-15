casper.start('http://demo.novius-os.org/admin/nos/login', function login() {
    this.test.assertExists('#login form', 'Login form is found');
    this.fill('#login form', {
		email: 'demo@novius-os.org',
		password : 'demo'
	}, true);
});

casper.then(function noviusos() {
	this.waitForSelector("#noviusos", (function() {
		this.test.assertTitle('Novius OS', 'Novius OS admin homepage title is the one expected');
	}), (function() {
        this.debugPage();
        this.die("Timeout reached. No novius OS ?");
        this.exit();
    }));
});

casper.then(function appdesk() {
	this.waitForSelector(".ui-sortable", (function() {
		this.test.assertExists('#apps a[href="admin/noviusos_blog/appdesk"]', 'Launcher blog exist and sortable');
	}), (function() {
        this.debugPage();
        this.die("Timeout reached. No launcher sortable ?");
        this.exit();
    }));
});

casper.run(function() {
    this.test.done();
});