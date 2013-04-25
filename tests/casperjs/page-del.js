casper.nosLogin();

// Launch Webpages application
casper.nosLaunch('noviusos_page', 'Webpages');

// Check Webpages appdesk is opened
casper.nosAppdeskLoad('Webpages');

// Check page exist
casper.nosAppdeskCheck('New test page modified', true);

// Click to open context menu on page
casper.then(function clickContext() {
    this.click(this.nosSelectorCurrentPanel + ' th span.ui-icon-triangle-1-s');
});

// Click on delete in context menu
casper.then(function appdeskContextMenu() {
    this.waitForSelector(casper.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list a.ui-state-error span.ui-icon-trash', function() {
        this.click(this.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list a.ui-state-error span.ui-icon-trash');
    }, function() {
        this.nosError('Timeout reached. No context menu open ?');
    });
});

// Check deletion popup, and confirm delete
casper.then(function popupDeletion() {
    this.waitForSelector('.ui-dialog .ui-dialog-titlebar', function() {
        this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Deleting the page');
        this.click('.ui-dialog button.ui-state-error');
    }, function() {
        this.nosError('Timeout reached. No popup deletion opened ?');
    });
});

// Check deleting is ok
casper.then(function deletionOK() {
    this.nosNotificationOK('Page not deleted ?');
});

// Check appdesk is reloaded
casper.nosAppdeskCheck('New test page modified', false);

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
