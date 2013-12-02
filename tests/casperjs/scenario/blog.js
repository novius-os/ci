exports.run = run;
function run() {
    casper.then(function() {
            this.echo('Blog tests', 'INFO_BAR');
        })
        .nosAppsTab()

        // Launch Blog application
        .nosLaunch('noviusos_blog', 'Blog')

        // Check Blog appdesk is opened
        .nosAppdeskLoad('Blog')

        // Click on add a category
        .then(function() {
            this.waitForText('Add a category', function() {
                this.clickLabel('Add a category', 'a');
            }, function() {
                this.nosError('Timeout reached. No "Add a category" ?');
            });
        })

        // Check Add form is opened, fill form
        .nosFormFill('Add a category', 'admin/noviusos_blog/category/insert_update', {
            cat_title: 'New category',
            cat_virtual_name: 'new-category'
        })

        // Submit Add form
        .nosFormSubmit()

        // Check adding is ok, appdesk is reloaded
        .nosFormCheck('New category')

        // Click on add a post
        .then(function() {
            this.waitForText('Add a post', function() {
                this.clickLabel('Add a post', 'span');
            }, function() {
                this.nosError('Timeout reached. No "Add a post" ?');
            });
        })

        // Check Add form is opened
        .nosFormFill('Add a post', 'admin/noviusos_blog/post/insert_update', {
            post_title: 'New blog post'
        })

        // Set blog post to published
        .then(function() {
            this.nosPublish();
        })

        // Set blog post content
        .then(function() {
            this.nosWaitWysiwyg(function() {
                this.evaluate(function() {
                    tinyMCE.get(0).setContent('<p>Blog content</p>');
                    tinyMCE.get(0).getContent();
                });
            });
        })

        // Set a tag for blog post
        .then(function() {
            this.nosAccordionOpen('Tags');
            this.waitForSelector(this.nosSelectorCurrentPanel + ' .tagit-new input', function() {
                this.sendKeys(this.nosSelectorCurrentPanel + ' .tagit-new input', 'tag-test');
            }, function() {
                this.nosError('Timeout reached. Tag inspector not loaded ?');
            });
        })

        // Set a category for blog post
        .then(function() {
            this.nosAccordionOpen('Categories');
            this.waitFor(function check() {
                return this.evaluate(function(sel) {
                    return $(sel + ' .wijmo-wijaccordion-content .wijmo-wijgrid-innercell span').filter(function () {
                        return $.trim($(this).text()) == 'New category';
                    }).length == 1;
                }, this.nosSelectorCurrentPanel);
            }, function() {
                this.evaluate(function(sel) {
                    var $input = $(sel + ' .wijmo-wijaccordion-content .wijmo-wijgrid-innercell span').filter(function() {
                            return $.trim($(this).text()) == 'New category';
                        }).parents('tr').find('input')

                    $input.get(0).checked = true;
                    $input.triggerHandler('click');
                }, this.nosSelectorCurrentPanel);
            }, function() {
                this.nosError('Timeout reached. Categories inspector not loaded ?');
            });
        })

        // Set a media for blog post
        .then(function() {
            this.mouseEvent('mouseover', this.nosSelectorCurrentPanel + ' .ui-widget.ui-inputfilethumb');
            this.clickLabel('Pick an image', 'span');

            this.waitForSelector('.ui-dialog th[title="Pick"]', function() {
                this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Pick an image');
                this.click('.ui-dialog th[title="Pick"]');
            }, function() {
                this.nosError('Timeout reached. No popup "Pick an image" opened ?');
            });
        })

        // Submit Add form
        .nosFormSubmit()

        // Check adding is ok, appdesk is reloaded
        .nosFormCheck('New blog post')

        // Check front
        .thenOpen(BASE_URL + 'new-blog-post.html?_cache=0', function front() {
            this.waitForText('Blog content', function() {
                this.test.assertSelectorHasText('#pagename', 'New blog post', 'Title OK');
                this.test.assertTitle('New test page modified - New blog post', 'Title meta OK');
                this.test.assertResourceExists('cache/media/new-folder/logo-novius-os/', 'Logo was loaded');
                this.test.assertSelectorHasText('.blognews_tags', 'tag-test', 'Tag OK');
                this.test.assertSelectorHasText('.blognews_categories', 'New category', 'Category OK');
            }, function() {
                this.nosError('Timeout reached. Front page "New blog post" not found ?');
            });
        })

        // Reload back-office
        .thenOpen(BASE_URL + 'admin/')

        // Check appdesk is reloaded
        .nosAppdeskCheck('New blog post', true)

        // Click to modify page
        .then(function() {
            this.click(this.nosSelectorCurrentPanel + ' tr.wijmo-wijgrid-row .wijmo-wijgrid-innercell a');
        })

        // Check Update form is opened
        .nosFormFill('New blog post', 'admin/noviusos_blog/post/insert_update/', {
            post_title: 'Updated blog post'
        })

        // Submit Update form
        .nosFormSubmit()

        // Check updating is ok, appdesk is reloaded
        .nosFormCheck('Updated blog post')

        // Click to open context menu on page
        .then(function() {
            this.click(this.nosSelectorCurrentPanel + ' .wijmo-wijsplitter-h-panel2 th span.ui-icon-trash');
        })

        // Check deletion popup, and confirm delete
        .then(function popupDeletion() {
            this.waitForSelector('.ui-dialog button.ui-state-error', function() {
                this.test.assertSelectorHasText('.ui-dialog .ui-dialog-titlebar', 'Deleting the post ‘Updated blog post’');
                this.click('.ui-dialog button.ui-state-error');
            }, function() {
                this.nosError('Timeout reached. No popup deletion opened ?');
            });
        })

        // Check deleting is ok
        .then(function deletionOK() {
            this.nosNotificationOK('Blog post not deleted ?');
        })

        // Check appdesk is reloaded
        .nosAppdeskCheck('Updated blog post', false);
}
