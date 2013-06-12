casper.nosLogin();

// Launch Webpages application
casper.nosLaunch('noviusos_page', 'Webpages');

// Check Webpages appdesk is opened
casper.nosAppdeskLoad('Webpages');

// Click on add a page
casper.then(function() {
    this.clickLabel('Add a page', 'span');
});

// Check Add form is opened
casper.nosFormFill('Add a page', 'admin/noviusos_page/page/insert_update', {
    page_title: 'New home'
});

// Publishing page
casper.then(function() {
    this.nosPublish();
});

// Submit Add form
casper.nosFormSubmit();

// Check adding is ok, appdesk is reloaded
casper.nosFormCheck('New home');

// Click to open context menu on page
casper.then(function clickContext() {
    this.evaluate(function(sel) {
        $(sel + ' th span.ui-icon-triangle-1-s').eq(1).click();
    }, this.nosSelectorCurrentPanel);
});

// Click on set as home page in context menu
casper.then(function appdeskContextMenu() {
    this.waitForSelector(this.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list span.ui-icon-home', function() {
        this.click(this.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list span.ui-icon-home');
    }, function() {
        this.nosError('Timeout reached. No context menu open ?');
    });
});

casper.then(function setHomeOK() {
    this.nosNotificationOK('Set home page not works ?');
});

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
