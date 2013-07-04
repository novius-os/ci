var BASE_URL = casper.cli.get('base_url'),
    capture_path = casper.cli.get('capture_path') || './',
    test_name = casper.cli.has(0) ? casper.cli.get(0) : 'test',
    utils = require('utils');

(function(casper) {
    var logLevel = casper.cli.get('log-level');
    if (casper.cli.get('color-dummy')) {
        casper.options.colorizerType = 'Dummy';
    }
    if (logLevel) {
        casper.options.logLevel = logLevel;
    }

    casper.options.waitTimeout = 10000;

    test_name = test_name.split('/');
    test_name = test_name[test_name.length - 1].replace('.js', '');

    casper.nosSelectorCurrentPanel = '.nos-ostabs-panel:not(.nos-ostabs-hide)';

    casper.nosTabSelected = function nosTabSelected(title) {
        if (this.exists('.nos-ostabs-selected .nos-ostabs-label')) {
            var tab = this.getElementInfo('.nos-ostabs-selected .nos-ostabs-label');
            return tab.text == title;
        }
        return false;
    };

    casper.on('error', function(msg, backtrace) {
        this.capture(capture_path + test_name + '-error.png', {
            top: 0,
            left: 0,
            width: 1024,
            height: 768
        });
    });

    casper.nosError = function nosError(message) {
        this.capture(capture_path + test_name + '-error.png', {
            top: 0,
            left: 0,
            width: 1024,
            height: 768
        });
        this.test.fail(message);
        this.test.done();
        return this;
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
        return this;
    };

    casper.nosAppsTab = function nosAppsTab() {
        this.then(function appstab() {
            this.waitForSelector('.nos-ostabs-appstab a', function() {
                this.test.assertExists('.nos-ostabs-appstab a', 'Administration loaded');
                this.click('.nos-ostabs-appstab a');
            }, function() {
                this.nosError("Timeout reached. No Apps tab ?");
            });
        });
        return this;
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
        return this;
    };

    casper.nosAppdeskLoad = function nosAppdeskLoad(title) {
        this.then(function appdesk() {
            this.waitFor(function () {
                return this.nosTabSelected(title);
            }, function() {
                this.test.assertTitle(title, 'Appdesk "' + title + '" is loaded');
            }, function() {
                this.nosError('Timeout reached. No Appdesk "' + title + '" ?');
            });

            this.waitForText('Loading');
            this.waitWhileSelector('.wijmo-wijgrid-loadingtext');
        });
        return this;
    };

    casper.nosFormFill = function nosFormFill(title, urlForm, fields) {
        this.then(function form() {
            this.waitFor(function () {
                return this.nosTabSelected(title);
            }, function() {
                this.test.assertTitle(title, '"' + title + '" form is loaded');
                this.waitForSelector('form[action*="' + urlForm + '"]', function () {
                    this.fill('form[action*="' + urlForm + '"]', fields, false);
                });
            }, function() {
                this.nosError('Timeout reached. No "' + title + '" form ?');
            });
        });
        return this;
    };

    casper.nosFormSubmit = function nosFormSubmit() {
        this.then(function formSubmit() {
            this.click(this.nosSelectorCurrentPanel + ' .nos-toolbar .nos-toolbar-left button');
        });
        return this;
    };

    casper.nosFormCheck = function nosFormCheck(title) {
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

        this.nosAppdeskCheck(title, true);
        return this;
    };

    casper.nosNotificationOK = function nosNotificationOK(error) {
        this.waitForSelector('.nos-notification .ui-icon-info', function() {
            this.test.assertSelectorExists('.nos-notification .ui-icon-info', 'Notification open');
            this.click('.nos-notification .ui-icon-close');
        }, error ? function() {
            this.nosError(error);
        } : null);
        return this;
    };

    casper.nosAppdeskCheck = function nosAppdeskCheck(title, present) {
        this.then(function appdeskCheck() {
            this.waitFor(function check() {
                return this.evaluate(function(sel, title, present) {
                    return $(sel + ' .wijmo-wijgrid-innercell').filter(function() {
                        return $.trim($(this).text()) == title;
                    }).length == present ? 1 : 0;
                }, this.nosSelectorCurrentPanel, title, present);
            }, function() {
                this.test.assertEval(function(args) {
                    return !!($(args.sel + ' .wijmo-wijgrid-innercell').filter(function () {
                        return $.trim($(this).text()) == args.title;
                    }).length == args.present);
                }, 'Grid row "' + title + '" ' + (present ? 'present' : 'absent'), {
                    sel: this.nosSelectorCurrentPanel,
                    title: title,
                    present: present
                });
            }, function() {
                this.nosError('Timeout reached. Appdesk not reloaded, "' + title + '" still ' + (present ? 'present' : 'absent') + ' ?');
            });
        });
        return this;
    };

    casper.nosPublish = function nosPublish() {
        this.click(this.nosSelectorCurrentPanel + ' img[src$="static/novius-os/admin/novius-os/img/icons/status-green.png"]');
        return this;
    };

    casper.nosWaitWysiwyg = function nosWaitWysiwyg(then) {
        this.waitFor(function check() {
            return this.evaluate(function() {
                return tinyMCE.get(0).initialized;
            });
        }, then, function() {
            this.nosError('Timeout reached. Wysiwyg not initialized ?');
        });
        return this;
    };

    casper.nosAccordionOpen = function nosAccordionOpen(title) {
        this.evaluate(function(sel, title) {
            $(sel + ' h3.wijmo-wijaccordion-header').filter(function() {
                return $.trim($(this).text()) == title;
            }).click();
        }, this.nosSelectorCurrentPanel, title);
        return this;
    };

    casper.start();
    casper.viewport(1024, 768);
})(casper);
