exports.run = run;
function run() {
    casper.then(function() {
            this.echo('Media delete tests', 'INFO_BAR');
        })

        .nosAppsTab()

        // Launch Media Centre application
        .nosLaunch('noviusos_media', 'Media Centre')

        // Check Media Centre appdesk is opened and click on add a folder
        .nosAppdeskLoad('Media Centre')

        // Check media exist
        .nosAppdeskCheck('Logo Novius Os', true)

        // Click to open deletion popup
        .then(function clickDel() {
            this.click(this.nosSelectorCurrentPanel + ' th span.ui-icon-trash');
        })

        // Check deletion popup, and confirm delete
        .then(function popupDeletion() {
            this.waitForSelector('.ui-dialog button.ui-state-error', function() {
                this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Deleting the media ‘Logo Novius Os’');
                this.evaluate(function() {
                    $('.ui-dialog form input.verification').val('1');
                });
                this.click('.ui-dialog button.ui-state-error');
            }, function() {
                this.nosError('Timeout reached. No popup deletion opened ?');
            });
        })

        // Check deleting is ok
        .then(function deletionOK() {
            this.nosNotificationOK('Media not deleted ?');
        })

        // Check appdesk is reloaded
        .nosAppdeskCheck('Logo Novius Os', false);
}