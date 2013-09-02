exports.run = run;
function run() {
    casper.then(function() {
            this.echo('New home tests', 'INFO_BAR');
        })

        .nosAppsTab()

        // Launch Webpages application
        .nosLaunch('noviusos_page', 'Webpages')

        // Check Webpages appdesk is opened
        .nosAppdeskLoad('Webpages')

        // Click on add a page
        .then(function() {
            this.waitForText('Add a page', function() {
                this.clickLabel('Add a page', 'span');
            }, function() {
                this.nosError('Timeout reached. No "Add a page" ?');
            });
        })

        // Check Add form is opened
        .nosFormFill('Add a page', 'admin/noviusos_page/page/insert_update', {
            page_title: 'New home'
        })

        // Publishing page
        .then(function() {
            this.nosPublish();
        })

        // Submit Add form
        .nosFormSubmit()

        // Check adding is ok, appdesk is reloaded
        .nosFormCheck('New home')

        // Click to open context menu on page
        .then(function clickContext() {
            this.evaluate(function(sel) {
                $(sel + ' th span.ui-icon-triangle-1-s').eq(1).click();
            }, this.nosSelectorCurrentPanel);
        })

        // Click on set as home page in context menu
        .then(function appdeskContextMenu() {
            this.waitForSelector(this.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list span.ui-icon-home', function() {
                this.click(this.nosSelectorCurrentPanel + ' .wijmo-wijmenu-list span.ui-icon-home');
            }, function() {
                this.nosError('Timeout reached. No context menu open ?');
            });
        })

        .then(function setHomeOK() {
            this.nosNotificationOK('Set home page not works ?');
        });
}