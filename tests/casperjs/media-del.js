casper.nosLogin();

// Launch Media Centre application
casper.nosLaunch('noviusos_media', 'Media Centre');

// Check Media Centre appdesk is opened and click on add a folder
casper.nosAppdeskLoad('Media Centre');

// Check media exist
casper.nosAppdeskCheck('Logo Novius Os', true);

// Click to open deletion popup
casper.then(function clickDel() {
    this.click(this.nosSelectorCurrentPanel + ' th span.ui-icon-trash');
});

// Check deletion popup, and confirm delete
casper.then(function popupDeletion() {
    this.waitForSelector('.ui-dialog .ui-dialog-titlebar', function() {
        this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Deleting the media ‘Logo Novius Os’');
        this.evaluate(function() {
            $('.ui-dialog form input.verification').val('1');
        });
        this.click('.ui-dialog button.ui-state-error');
    }, function() {
        this.nosError('Timeout reached. No popup deletion opened ?');
    });
});

// Check deleting is ok
casper.then(function deletionOK() {
    this.nosNotificationOK('Media not deleted ?');
});

// Check appdesk is reloaded
casper.nosAppdeskCheck('Logo Novius Os', false);

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
