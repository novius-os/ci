var BASE_URL = casper.cli.get(1),
    pathlogin = casper.cli.get(0).replace('appmanager.js', 'login.js'),
    apps = [
        {name:'noviusos_appwizard', title:'App Wizard'},
        {name:'noviusos_blognews', title:'Blog / News'},
        {name:'noviusos_blog', title:'Blog'},
        {name:'noviusos_news', title:'News'},
        {name:'noviusos_comments', title:'Comments'},
        {name:'noviusos_form', title:'Form'},
        {name:'noviusos_slideshow', title:'Slideshow'},
        {name:'noviusos_simplefacebook', title:'Simple Facebook'},
        {name:'noviusos_simplegoogleplus', title:'Simple Google+'},
        {name:'noviusos_simpletwitter', title:'Simple Twitter'}
    ],
    apps_index = 0,
    app_install = function() {
        var app = apps[apps_index];
        if (app) {
            casper.test.assertSelectorHasText('a[data-app*=\'"' + app.name + '"\']', 'Install', app.title + ' is uninstall');
            casper.click('a[data-app*=\'"' + app.name + '"\']');

            casper.then(function step2() {
                this.waitForSelector('a[data-app*=\'"' + app.name + '"\'] span.ui-icon-arrowthick-1-s', (function() {
                    this.test.assertSelectorHasText('a[data-app*=\'"' + app.name + '"\']', 'Uninstall', app.title + ' installed');
                    this.test.assertSelectorHasText('.nos-notification', 'Installation successful');
                    this.click('.nos-notification .ui-icon-close');
                    apps_index++;
                    app_install();
                }), (function() {
                    this.debugPage();
                    this.test.fail('Timeout reached. No button ' + app.title + ' Uninstall ?');
                    this.test.done();
                }));
            });
        }
    };
;

require(pathlogin);

casper.then(function launch() {
    this.waitForSelector('a[data-launcher*=noviusos_appmanager]', (function() {
        this.test.assertSelectorHasText('a[data-launcher*=noviusos_appmanager]', 'Application manager', 'Have application manager launcher');
        this.click('a[data-launcher*=noviusos_appmanager]');
    }), (function() {
        this.debugPage();
        this.test.fail('Timeout reached. No Applications manager launcher ?');
        this.test.done();
    }));
});

casper.then(function step1() {
    this.waitForText('Novius OS framework configuration', (function() {
        this.test.assertTextExists('Novius OS framework configuration', 'Tab application manager');
        app_install();
    }), (function() {
        this.debugPage();
        this.test.fail('Timeout reached. No tab Applications manager ?');
        this.test.done();
    }));
});

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
