var apps = [
        {name:'noviusos_appwizard', title:'App Wizard'},
        {name:'noviusos_blognews', title:'Blog / News'},
        {name:'noviusos_blog', title:'Blog'},
        {name:'noviusos_news', title:'News'},
        {name:'noviusos_comments', title:'Comments', required: true},
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
            if (app.required) {
                casper.test.assertSelectorExists('label[data-app*=\'"' + app.name + '"\']', app.title + ' is automatically installed as it is required by other installed applications.');
            } else {
                casper.test.assertSelectorHasText('a[data-app*=\'"' + app.name + '"\']', 'Install', app.title + ' is not in available applications.');
                casper.click('a[data-app*=\'"' + app.name + '"\']');

                casper.then(function step2() {
                    this.waitForSelector('a[data-app*=\'"' + app.name + '"\'] span.ui-icon-arrowthick-1-s', (function() {
                        this.test.assertSelectorHasText('a[data-app*=\'"' + app.name + '"\']', 'Uninstall', app.title + ' installed');
                        this.test.assertSelectorHasText('.nos-notification', 'Great, a new app! Installed and ready to use.');
                        this.click('.nos-notification .ui-icon-close');
                        apps_index++;
                        app_install();
                    }), (function() {
                        this.nosError('Timeout reached. No button ' + app.title + ' Uninstall ?');
                    }));
                });
            }
        }
    };

casper.nosLogin()
    .nosAppsTab()

    .then(function launch() {
        this.waitForSelector('a[data-launcher*=noviusos_appmanager]', (function() {
            this.test.assertSelectorHasText('a[data-launcher*=noviusos_appmanager]', 'Applications manager', 'Have application manager launcher');
            this.click('a[data-launcher*=noviusos_appmanager]');
        }), function() {
            this.nosError('Timeout reached. No Applications manager launcher ?');
        });
    })

    .then(function step1() {
        casper.waitFor(function () {
            return this.nosTabSelected('Applications manager');
        }, function() {
            this.test.assertTitle('Applications manager', 'Applications manager is loaded');
            app_install();
        }, function() {
            this.nosError('Timeout reached. No tab Applications manager ?');
        });
    })

    .run(function() {
        this.test.done();
        this.test.renderResults(true);
    });
