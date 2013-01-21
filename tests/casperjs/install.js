var DB_HOST = casper.cli.get('host') || 'localhost',
    DB_USER = casper.cli.get('user') || 'root',
    DB_PASS = casper.cli.get('password') || '',
    DB_NAME = casper.cli.get('db') || 'novius_os';

casper.start(BASE_URL + 'install.php', function step1() {
    this.waitForSelector('form input[type=submit][value="Move on to the next step"]', (function() {
        this.test.assertExists('form input[type=submit][value="Move on to the next step"]', 'Move on to the next step is found');
        this.click('form input[type=submit][value="Move on to the next step"]');
    }), function() {
        this.nosError('Timeout reached. No first step ?');
    });
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
    }), function() {
        this.nosError('Timeout reached. No second step ?');
    });
});

casper.then(function step3() {
    this.waitForSelector('form', (function() {
        this.test.assertTextExists('Create the first administrator account', 'Step 3 loaded');
        this.fill('form', {
            name: 'Test',
            firstname: 'Test',
            email: 'test@test.org',
            password: 'longpassword',
            password_confirmation: 'longpassword'
        }, true);
    }), function() {
        this.nosError('Timeout reached. No third step ?');
    });
});

casper.then(function step4() {
    this.waitForSelector('a[href="admin/?tab=admin/noviusos_appmanager/appmanager"]', (function() {
        this.test.assertTextExists('Setup contexts', 'Step 4 loaded');
        this.click('a[href="admin/?tab=admin/noviusos_appmanager/appmanager"]');
    }), function() {
        this.nosError('Timeout reached. No fourth step ?');
    });
});

casper.then(function login() {
    this.waitForSelector('#login', (function() {
        this.test.assertExists('#login form', 'Login form is found');
        this.fill('#login form', {
            email: 'test@test.org',
            password : 'longpassword'
        }, true);
    }), function() {
        this.nosError('Timeout reached. No login form ?');
    });
});

casper.then(function appManager() {
    this.waitFor(function () {
        return this.nosTabSelected('Applications manager');
    }, function() {
        this.test.assertTitle('Applications manager', 'Applications manager is loaded');
    }, function() {
        this.nosError('Timeout reached. No Applications manager ?');
    });
});

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
