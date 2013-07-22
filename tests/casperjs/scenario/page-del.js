exports.run = run;
function run() {
    casper.then(function() {
            this.echo('Webpage delete tests', 'INFO_BAR');
        })

        .nosAppsTab()

        // Launch Webpages application
        .nosLaunch('noviusos_page', 'Webpages')

        // Check Webpages appdesk is opened
        .nosAppdeskLoad('Webpages')

        // Check page exist
        .nosAppdeskCheck('New test page modified', true)

        // Click to open context menu on page
        .then(function clickContext() {
            this.evaluate(function(sel) {
                $(sel + ' th span.ui-icon-triangle-1-s:first').click();
            }, this.nosSelectorCurrentPanel);
        })

        // Click on delete in context menu
        .then(function appdeskContextMenu() {
            this.waitForSelector(this.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list a.ui-state-error span.ui-icon-trash', function() {
                this.capture(capture_path + test_name + '-trash.png', {
                    top: 0,
                    left: 0,
                    width: 1024,
                    height: 768
                });
                this.test.assertSelectorHasText(this.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list a.ui-state-error', 'Delete');
                this.evaluate(function(sel) {
                    $(sel + ' .wijmo-wijmenu-list a.ui-state-error span.ui-icon-trash').click();
                }, this.nosSelectorCurrentPanel);
            }, function() {
                this.nosError('Timeout reached. No context menu open ?');
            });
        })

        // Check deletion popup, and confirm delete
        .then(function popupDeletion() {
            this.waitForSelector('.ui-dialog button.ui-state-error', function() {
                this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Deleting the page');
                this.click('.ui-dialog button.ui-state-error');
            }, function() {
                this.nosError('Timeout reached. No popup deletion opened ?');
            });
        })

        // Check deleting is ok
        .then(function deletionOK() {
            this.nosNotificationOK('Page not deleted ?');
        })

        // Check appdesk is reloaded
        .nosAppdeskCheck('New test page modified', false);
}