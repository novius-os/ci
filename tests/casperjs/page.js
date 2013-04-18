casper.nosLogin();

// Launch Webpages application
casper.nosLaunch('noviusos_page', 'Webpages');

// Check Webpages appdesk is opened and click on add a page
casper.nosAppdesk('Webpages', function() {
    this.clickLabel('Add a page', 'span');
});

// Check Add form is opened, fill form and submit
casper.nosForm('Add a page', 'admin/noviusos_page/page/insert_update', {
    page_title: 'New test page',
    page_menu: '1',
    page_menu_title: 'Test menu',
    page_meta_title: 'Test meta',
    page_virtual_name: 'test-url'
}, 'Add', function() {
    this.click(casper.nosSelectorCurrentPanel + ' img[src$="static/novius-os/admin/novius-os/img/icons/status-green.png"]');

    this.waitFor(function check() {
        return this.evaluate(function() {
            return tinyMCE.get(0).initialized;
        });
    }, function() {
        this.evaluate(function() {
            tinyMCE.get(0).setContent('<p>Test content</p>');
            tinyMCE.get(0).getContent();
        });
    }, function() {
        this.nosError('Timeout reached. Wysiwyg not initialized ?');
    });
});

// Check adding is ok, appdesk is reloaded
casper.nosFormOK('New test page');

// Check front page
casper.thenOpen(BASE_URL + 'test-url.html', function front() {
    this.waitForText('Test content', function() {
        this.test.assertHttpStatus(301);
        this.test.assertSelectorHasText('#menu li a', 'Test menu', 'Title menu OK');
        this.test.assertSelectorHasText('#pagename', 'New test page', 'Title OK');
        this.test.assertTitle('Test meta', 'Title meta OK');
        this.test.assertSelectorHasText('#content p', 'Test content', 'Content OK');
    }, function() {
        this.nosError('Timeout reached. Front page "New test page" not found ?');
    });
});

// Reload back-office
casper.thenOpen(BASE_URL + 'admin/');

// Check appdesk is reloaded, then click to modify page
casper.nosAppdeskCheck('New test page', true, function() {
    this.click(casper.nosSelectorCurrentPanel + ' tr.wijmo-wijgrid-row .wijmo-wijgrid-innercell a');
});

// Check Update form is opened, fill form and submit
casper.nosForm('New test page', 'admin/noviusos_page/page/insert_update/', {
    page_title: 'New test page modified'
});

// Check updating is ok, appdesk is reloaded, then click to open context menu on page
casper.nosFormOK('New test page modified', function() {
    this.click(casper.nosSelectorCurrentPanel + ' th span.ui-icon-triangle-1-s');
});

// Click on delete in context menu
casper.then(function appdeskContextMenu() {
    casper.waitForSelector(casper.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list a.ui-state-error span.ui-icon-trash', function() {
        this.click(casper.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list a.ui-state-error span.ui-icon-trash');
    }, function() {
        this.nosError('Timeout reached. No context menu open ?');
    });
});

// Check deletion popup, and confirm delete
casper.then(function popupDeletion() {
    casper.waitForSelector('.ui-dialog .ui-dialog-titlebar', function() {
        this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Deleting the page');
        this.click('.ui-dialog button.ui-state-error');
    }, function() {
        this.nosError('Timeout reached. No popup deletion opened ?');
    });
});

// Check deleting is ok
casper.then(function deletionOK() {
    casper.nosNotificationOK('Page not deleted ?');
});

// Check appdesk is reloaded
casper.nosAppdeskCheck('New test page modified', false);

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
