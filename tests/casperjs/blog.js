casper.nosLogin();

// Launch Blog application
casper.nosLaunch('noviusos_blog', 'Blog');

// Check Blog appdesk is opened and click on add a category
casper.nosAppdesk('Blog', function() {
    this.clickLabel('Add a category', 'a');
});

// Check Add form is opened, fill form and submit
casper.nosForm('Add a category', 'admin/noviusos_blog/category/insert_update', {
    cat_title: 'New category',
    cat_virtual_name: 'new-category'
}, 'Add');

// Check adding is ok, appdesk is reloaded, click on add a post
casper.nosFormOK('New category', function() {
    this.clickLabel('Add a post', 'span');
});

// Check Add form is opened, fill form and submit
casper.nosForm('Add a post', 'admin/noviusos_blog/post/insert_update', {
    post_title: 'New blog post'
}, 'Add', function() {

    // Set blog post to published
    this.click(casper.nosSelectorCurrentPanel + ' img[src$="static/novius-os/admin/novius-os/img/icons/status-green.png"]');

    // Set blog post content
    this.waitFor(function check() {
        return this.evaluate(function() {
            return tinyMCE.get(0).initialized;
        });
    }, function() {
        this.evaluate(function() {
            tinyMCE.get(0).setContent('<p>Blog content</p>');
            tinyMCE.get(0).getContent();
        });
    }, function() {
        this.nosError('Timeout reached. Wysiwyg not initialized ?');
    });

    // Set a tag for blog post
    this.evaluate(function(sel) {
        $(sel + ' h3.wijmo-wijaccordion-header').filter(function() {
            return $.trim($(this).text()) == 'Tags';
        }).click();
    }, casper.nosSelectorCurrentPanel);
    this.waitForSelector(casper.nosSelectorCurrentPanel + ' .tagit-new input', function() {
        this.sendKeys(casper.nosSelectorCurrentPanel + ' .tagit-new input', 'tag-test');
    }, function() {
        this.nosError('Timeout reached. Tag inspector not loaded ?');
    });

    // Set a category for blog post
    this.evaluate(function(sel) {
        $(sel + ' h3.wijmo-wijaccordion-header').filter(function() {
            return $.trim($(this).text()) == 'Categories';
        }).click();
    }, casper.nosSelectorCurrentPanel);
    this.waitFor(function check() {
        return this.evaluate(function(sel) {
            return $(sel + ' .wijmo-wijaccordion-content .wijmo-wijgrid-innercell span').filter(function() {
                return $.trim($(this).text()) == 'New category';
            }).length == 1;
        }, this.nosSelectorCurrentPanel);
    }, function() {
        this.evaluate(function(sel) {
            $(sel + ' .wijmo-wijaccordion-content .wijmo-wijgrid-innercell span').filter(function() {
                    return $.trim($(this).text()) == 'New category';
                })
                .parent('td')
                .prev('td')
                .find('input')
                .click();
        }, casper.nosSelectorCurrentPanel);
    }, function() {
        this.nosError('Timeout reached. Categories inspector not loaded ?');
    });
});

// Check adding is ok, appdesk is reloaded
casper.nosFormOK('New blog post');

// Check front
/*casper.thenOpen(BASE_URL + 'test-url.html', function front() {
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
*/

// Check appdesk is reloaded, then click to modify page
casper.nosAppdeskCheck('New blog post', true, function() {
    this.click(casper.nosSelectorCurrentPanel + ' tr.wijmo-wijgrid-row .wijmo-wijgrid-innercell a');
});

// Check Update form is opened, fill form and submit
casper.nosForm('New blog post', 'admin/noviusos_blog/post/insert_update/', {
    post_title: 'Updated blog post'
});

// Check updating is ok, appdesk is reloaded, then click to open context menu on page
casper.nosFormOK('Updated blog post', function() {
    this.click(casper.nosSelectorCurrentPanel + ' .wijmo-wijsplitter-h-panel2 th span.ui-icon-trash');
});

// Check deletion popup, and confirm delete
casper.then(function popupDeletion() {
    casper.waitForSelector('.ui-dialog .ui-dialog-titlebar', function() {
        this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Deleting the post ‘Updated blog post’');
        this.click('.ui-dialog button.ui-state-error');
    }, function() {
        this.nosError('Timeout reached. No popup deletion opened ?');
    });
});

// Check deleting is ok
casper.then(function deletionOK() {
    casper.nosNotificationOK('Blog post not deleted ?');
});

// Check appdesk is reloaded
casper.nosAppdeskCheck('Updated blog post', false);

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
