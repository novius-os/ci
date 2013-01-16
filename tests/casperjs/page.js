var pathlogin = casper.cli.get(0).replace('page.js', 'login.js'),
    error = function(message) {
        casper.capture('error.png', {
            top: 0,
            left: 0,
            width: 1024,
            height: 768
        });
        casper.test.fail(message);
        casper.test.done();
    },
    tabSelected = function(title) {
        var tab = casper.getElementInfo('.nos-ostabs-selected .nos-ostabs-label');
        return tab && tab.text == title;
    };

require(pathlogin);

casper.viewport(1024, 768);

casper.then(function launch() {
    this.waitForSelector('a[data-launcher*=noviusos_page]', (function() {
        this.test.assertSelectorHasText('a[data-launcher*=noviusos_page]', 'Pages', 'Have Pages launcher');
        this.click('a[data-launcher*=noviusos_page]');
    }), (function() {
        error('Timeout reached. No Page launcher ?');
    }));
});

casper.then(function appdeskPage() {
    casper.waitFor(function () {
        return tabSelected('Pages');
    }, function() {
        this.test.assertTitle('Pages', 'Appdesk Pages is loaded');
        this.clickLabel('Add a page', 'span');
    }, function() {
        error("Timeout reached. No Appdesk Pages ?");
    });
});

casper.then(function addAPage() {
    casper.waitFor(function () {
        return tabSelected('Add a page');
    }, function() {
        this.test.assertTitle('Add a page', 'Add page form is loaded');
        this.fill('form[action$="admin/noviusos_page/page/insert_update"]', {
            page_title: 'New test page'
        }, false);
        this.clickLabel('Add', 'span');
    }, function() {
        error("Timeout reached. No add page form ?");
    });
});

casper.then(function addAPageOK() {
    casper.waitFor(function () {
        return tabSelected('New test page');
    }, function() {
        this.test.assertTitle('New test page', 'New test page is created');
        casper.waitForSelector('.nos-notification .ui-icon-info', function() {
            this.test.assertSelectorExists('.nos-notification .ui-icon-info', 'Notification open');
            this.click('.nos-notification .ui-icon-close');
        });
        this.click('.nos-ostabs-panel:not(.nos-ostabs-hide) .nos-ostabs-actions .nos-ostabs-close');
    }, function() {
        error("Timeout reached. No update page form ?");
    });
});

casper.then(function appdeskCreatedOK() {
    casper.waitFor(function check() {
        return this.evaluate(function() {
            return $('.wijmo-wijgrid-innercell a').filter(function() {
                return $.trim($(this).text()) == 'New test page';
            }).length == 1;
        });
    }, function() {
        this.test.assertSelectorHasText('.nos-ostabs-panel:not(.nos-ostabs-hide) tr.wijmo-wijgrid-row .wijmo-wijgrid-innercell a', 'New test page');
        this.click('.nos-ostabs-panel:not(.nos-ostabs-hide) tr.wijmo-wijgrid-row .wijmo-wijgrid-innercell a');
    }, function() {
        error("Timeout reached. No reload appdesk insert ?");
    });
});

casper.then(function editPage() {
    casper.waitFor(function () {
        return tabSelected('New test page');
    }, function() {
        this.test.assertTitle('New test page', 'New test page form is loaded');
        this.fill('form[action*="admin/noviusos_page/page/insert_update/"]', {
            page_title: 'New test page modified'
        }, false);
        this.clickLabel('Save', 'span');
    }, function() {
        error("Timeout reached. No update page form ?");
    });
});

casper.then(function editPageOK() {
    casper.waitForSelector('.nos-notification .ui-icon-info', function() {
        this.test.assertSelectorExists('.nos-notification .ui-icon-info', 'Notification open');
        this.click('.nos-notification .ui-icon-close');
        this.click('.nos-ostabs-panel:not(.nos-ostabs-hide) .nos-ostabs-actions .nos-ostabs-close');
    }, function() {
        error("Timeout reached. Page not updated ?");
    });
});

casper.then(function appdeskUpdatedOK() {
    casper.waitFor(function check() {
        return this.evaluate(function() {
            return $('.wijmo-wijgrid-innercell a').filter(function() {
                return $.trim($(this).text()) == 'New test page modified';
            }).length == 1;
        });
    }, function() {
        this.test.assertSelectorHasText('.nos-ostabs-panel:not(.nos-ostabs-hide) tr.wijmo-wijgrid-row .wijmo-wijgrid-innercell a', 'New test page modified');
        this.click('.nos-ostabs-panel:not(.nos-ostabs-hide) th span.ui-icon-triangle-1-s');
    }, function() {
        error("Timeout reached. No reload appdesk after update ?");
    });
});

casper.then(function appdeskContextMenu() {
    casper.waitForSelector('.nos-ostabs-panel:not(.nos-ostabs-hide) .wijmo-wijmenu-list a.ui-state-error span.ui-icon-trash', function() {
        this.click('.nos-ostabs-panel:not(.nos-ostabs-hide) .wijmo-wijmenu-list a.ui-state-error span.ui-icon-trash');
    }, function() {
        error("Timeout reached. No context menu open ?");
    });
});

casper.then(function popupDeletion() {
    casper.waitForSelector('.ui-dialog .ui-dialog-titlebar', function() {
        this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Deleting the page');
        this.click('.ui-dialog button.ui-state-error');
    }, function() {
        error("Timeout reached. No context menu open ?");
    });
});

casper.then(function deletionOK() {
    casper.waitForSelector('.nos-notification .ui-icon-info', function() {
        this.test.assertSelectorHasText('.nos-notification', 'The page has been deleted.', 'Notification open');
        this.click('.nos-notification .ui-icon-close');
    }, function() {
        error("Timeout reached. Page not updated ?");
    });
});

casper.then(function appdeskDeletionOK() {
    casper.waitFor(function check() {
        return this.evaluate(function() {
            return $('.nos-ostabs-panel:not(.nos-ostabs-hide) .wijmo-wijgrid-innercell a').filter(function() {
                return $.trim($(this).text()) == 'New test page modified';
            }).length == 0;
        });
    }, function() {
        this.test.assertDoesntExist('.nos-ostabs-panel:not(.nos-ostabs-hide) tr.wijmo-wijgrid-row .wijmo-wijgrid-innercell a', 'New test page deleted');
    }, function() {
        error("Timeout reached. No reload appdesk after delete ?");
    });
});

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
