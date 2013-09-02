exports.run = run;
function run() {
    casper.then(function() {
            this.echo('Webpages tests', 'INFO_BAR');
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
            page_title: 'New test page',
            page_menu: '1',
            page_menu_title: 'Test menu',
            page_meta_title: 'Test meta',
            page_virtual_name: 'test-url'
        })

        // Publishing page and open wysiwyg insert an image
        .then(function() {
            this.nosPublish();

            this.nosWaitWysiwyg(function() {
                this.click(this.nosSelectorCurrentPanel + ' .mceButton.mce_image[title="Insert/Edit Image"]');
            });
        })

        // Choose an image to insert into wysiwyg
        .then(function() {
            this.waitForSelector('.ui-dialog th[title="Pick"]', function() {
                this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Insert an image');
                this.click('.ui-dialog th[title="Pick"]');
            }, function() {
                this.nosError('Timeout reached. No popup "Insert an image" opened ?');
            });
        })

        // Valid image to insert into wysiwyg
        .then(function() {
            this.waitForSelector('.ui-dialog .ui-tabs-panel:not(.ui-tabs-hide) button[type="Submit"]', function() {
                this.test.assertSelectorHasText('.ui-dialog .ui-tabs-panel:not(.ui-tabs-hide) button[type="Submit"]', 'Insert this image');
                this.click('.ui-dialog .ui-tabs-panel:not(.ui-tabs-hide) button[type="Submit"]');
            }, function() {
                this.nosError('Timeout reached. No popup "Set the properties" tab opened ?');
            });
        })

        // Submit Add form
        .nosFormSubmit()

        // Check adding is ok, appdesk is reloaded
        .nosFormCheck('New test page')

        // Check front page
        .thenOpen(BASE_URL + 'test-url.html?_cache=0', function front() {
            this.waitForText('New test page', function() {
                this.test.assertHttpStatus(301);
                this.test.assertSelectorHasText('#menu li a', 'Test menu', 'Title menu OK');
                this.test.assertSelectorHasText('#pagename', 'New test page', 'Title OK');
                this.test.assertTitle('Test meta', 'Title meta OK');
                this.test.assertResourceExists('media/new-folder/logo-novius-os.png', 'Logo was loaded');
            }, function() {
                this.nosError('Timeout reached. Front page "New test page" not found ?');
            });
        })

        // Reload back-office
        .thenOpen(BASE_URL + 'admin/')

        // Check appdesk is reloaded
        .nosAppdeskCheck('New test page', true)

        // Click to modify page
        .then(function() {
            this.click(this.nosSelectorCurrentPanel + ' tr.wijmo-wijgrid-row .wijmo-wijgrid-innercell a');
        })

        // Check Update form is opened
        .nosFormFill('New test page', 'admin/noviusos_page/page/insert_update/', {
            page_title: 'New test page modified'
        })

        // Clear wysiwyg and click to add an enhancer
        .then(function() {
            this.nosWaitWysiwyg(function() {
                this.evaluate(function() {
                    return tinyMCE.get(0).setContent('');
                });

                this.click(this.nosSelectorCurrentPanel + ' .mceButton.mce_enhancer[title="Applications"]');
            });
        })

        // Click to open blog enhancer popup
        .then(function() {
            this.waitForSelector('tr#enhancer_noviusos_blog', function() {
                this.click('tr#enhancer_noviusos_blog');
            }, function() {
                this.nosError('Timeout reached. No enhancer blog ?');
            });
        })

        // Valid enhancer popup
       .then(function() {
            this.waitForSelector('.ui-dialog button[type="submit"]', function() {
                this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Blog');
                this.click('.ui-dialog button[type="submit"]');
            }, function() {
                this.nosError('Timeout reached. No popup "Blog" opened ?');
            });
        })

        // Wait for enhancer blog add to wysiwyg
        .then(function() {
            this.waitFor(function() {
                return this.evaluate(function() {
                    return tinyMCE.get(0).getContent().indexOf('noviusos_blog') != -1;
                });
            });
        })

        // Submit Update form
        .nosFormSubmit()

        // Check updating is ok, appdesk is reloaded, then click to open context menu on page
        .nosFormCheck('New test page modified')

        // Check front page
        .thenOpen(BASE_URL + '?_cache=0', function front() {
            this.waitForText('New test page modified', function() {
                this.test.assertSelectorHasText('#pagename', 'New test page modified', 'Title OK');
                this.test.assertSelectorExists('#content .blognews_posts_list', 'Blog OK');
            }, function() {
                this.nosError('Timeout reached. Front page "New test page" not found ?');
            });
        })

        // Reload back-office
        .thenOpen(BASE_URL + 'admin/');
}
