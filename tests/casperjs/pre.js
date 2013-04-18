var BASE_URL = casper.cli.get('base_url'),
    capture_path = casper.cli.get('capture_path') || './',
    test_name = casper.cli.get(0)
    utils = require('utils');

(function(casper) {
    if (casper.cli.get('color-dummy')) {
        casper.options.colorizerType = 'Dummy';
    }
    if (logLevel = casper.cli.get('log-level')) {
        casper.options.logLevel = logLevel;
    }

    test_name = test_name.split('/');
    test_name = test_name[test_name.length - 1].replace('.js', '');

    casper.nosSelectorCurrentPanel = '.nos-ostabs-panel:not(.nos-ostabs-hide)';

    casper.nosTabSelected = function nosTabSelected(title) {
        var tab = this.getElementInfo('.nos-ostabs-selected .nos-ostabs-label');
        return tab && tab.text == title;
    };

    casper.nosError = function nosError(message) {
        this.capture(capture_path + test_name + '-error.png', {
            top: 0,
            left: 0,
            width: 1024,
            height: 768
        });
        this.test.fail(message);
        this.test.done();
    };

    casper.nosLogin = function nosLogin() {
        this.thenOpen(BASE_URL + 'admin/nos/login/reset', function login() {
            this.waitForSelector('#login', function() {
                this.test.assertExists('#login form', 'Login form is found');
                this.fill('#login form', {
                    email: 'test@test.org',
                    password : 'longpassword'
                }, true);
            }, function() {
                this.nosError("Timeout reached. No login form ?");
            });
        });

        this.then(function appstab() {
            this.waitForSelector('.nos-ostabs-appstab a', function() {
                this.test.assertExists('.nos-ostabs-appstab a', 'Administration loaded');
                this.click('.nos-ostabs-appstab a');
            }, function() {
                this.nosError("Timeout reached. No Apps tab ?");
            });
        });
    };

    casper.nosLaunch = function nosLaunch(launcher, title) {
        this.then(function launch() {
            this.waitForSelector('a[data-launcher*=' + launcher + ']', (function() {
                this.test.assertSelectorHasText('a[data-launcher*=' + launcher + ']', title, 'Have "' + title + '" launcher');
                this.click('a[data-launcher*=' + launcher + ']');
            }), (function() {
                this.nosError('Timeout reached. No "' + title + '" launcher ?');
            }));
        });
    };

    casper.nosAppdesk = function nosAppdesk(title, click) {
        this.then(function appdesk() {
            this.waitFor(function () {
                return this.nosTabSelected(title);
            }, function() {
                this.test.assertTitle(title, 'Appdesk "' + title + '" is loaded');
                click.call(this);
            }, function() {
                this.nosError('Timeout reached. No Appdesk "' + title + '" ?');
            });
        });
    };

    casper.nosForm = function nosForm(title, urlForm, fields, submitLabel, othersAction) {
        submitLabel = submitLabel || 'Save';
        this.then(function form() {
            this.waitFor(function () {
                return this.nosTabSelected(title);
            }, function() {
                this.test.assertTitle(title, '"' + title + '" form is loaded');
                this.waitForSelector('form[action*="' + urlForm + '"]', function () {
                    this.fill('form[action*="' + urlForm + '"]', fields, false);
                    if (othersAction) {
                        othersAction.call(this);
                    }
                });
            }, function() {
                this.nosError('Timeout reached. No "' + title + '" form ?');
            });
        });

        this.then(function form() {
            this.clickLabel(submitLabel, 'span');
        });
    };

    casper.nosNotificationOK = function nosNotificationOK(error) {
        this.waitForSelector('.nos-notification .ui-icon-info', function() {
            this.test.assertSelectorExists('.nos-notification .ui-icon-info', 'Notification open');
            this.click('.nos-notification .ui-icon-close');
        }, error ? function() {
            this.nosError(error);
        } : null);
    };

    casper.nosAppdeskCheck = function nosAppdeskCheck(title, present, click) {
        this.then(function appdeskCheck() {
            this.waitFor(function check() {
                return this.evaluate(function(sel, title, present) {
                    return $(sel + ' .wijmo-wijgrid-innercell').filter(function() {
                        return $.trim($(this).text()) == title;
                    }).length == present ? 1 : 0;
                }, this.nosSelectorCurrentPanel, title, present);
            }, function() {
                this.test.assertEval(function(args) {
                    return $(args.sel + ' .wijmo-wijgrid-innercell').filter(function() {
                        return $.trim($(this).text()) == args.title;
                    }).length == args.present ? true : false;
                }, 'Grid row "' + title + '" ' + (present ? 'present' : 'absent'), {
                    sel: this.nosSelectorCurrentPanel,
                    title: title,
                    present: present
                });
                if (click) {
                    click.call(this);
                }
            }, function() {
                this.nosError('Timeout reached. Appdesk not reloaded, "' + title + '" still ' + (present ? 'present' : 'absent') + ' ?');
            });
        });
    };

    casper.nosFormOK = function nosFormOK(title, click) {
        this.then(function formOK() {
            this.waitFor(function () {
                return this.nosTabSelected(title);
            }, function() {
                this.test.assertTitle(title, '"' + title + '" is created');
                this.nosNotificationOK();
                this.click(this.nosSelectorCurrentPanel + ' .nos-ostabs-actions .nos-ostabs-close');
            }, function() {
                this.nosError('Timeout reached. "' + title + '" is not created ?');
            });
        });

        this.nosAppdeskCheck(title, true, click);
    };


    casper.start();
    casper.viewport(1024, 768);
})(casper);
