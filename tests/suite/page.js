var casper = require('casper').create({
    verbose: true,
    logLevel: "debug"
});

require('/data/home/lyon/felix/www/novius-os-test/ci/tests/suite/login.js');

casper.then(function launchPage() {
    casper.waitForSelector('a.app[data-launcher*="nos_page"]', function() {
        this.click('a.app[data-launcher*="nos_page"]');
    }, function() {
        this.debugPage();
        this.test.fail("Timeout reached. No first step ?");
    });
});

casper.then(function appdeskPage() {
    casper.waitFor(function() {
        return this.evaluate(function() {
            return document.title === 'Pages';
        });
    }, function() {
        this.test.assertTitle('Pages', 'Appdesk Pages is loaded');
        this.click('.nos-ostabs-panel:not(.nos-ostabs-hide) .nos-toolbar-left button.primary');
    }, function() {
        this.debugPage();
        this.test.fail("Timeout reached. No Appdesk Pages ?");
    });
});

casper.then(function addAPage() {
    casper.waitFor(function() {
        return this.evaluate(function() {
            return document.title === 'Add a page';
        });
    }, function() {
        this.test.assertTitle('Add a page', 'Add page form is loaded');
        this.fill('.nos-ostabs-panel:not(.nos-ostabs-hide) form[action$="admin/nos/page/page/insert_update"]', {
            page_title: 'New test page'
        }, false);
        this.click('.nos-ostabs-panel:not(.nos-ostabs-hide) .nos-toolbar button[name="save"]');
    }, function() {
        this.debugPage();
        this.test.fail("Timeout reached. No add page form ?");
    });
});

casper.then(function() {
    this.viewport(1024, 768);
    casper.waitForSelector(function() {
        return this.evaluate(function() {
            return document.title === 'New test page';
        });
    }, function() {

        //this.test.assertTitle('New test page', 'Update page form is loaded');
        this.test.assertExists('#noviusos');
        this.capture('capture.png', {
            top: 0,
            left: 0,
            width: 1024,
            height: 768
        });
        //this.debugHTML();
        //this.click('.nos-ostabs-tabs li[title="Pages"] a');
    }, function() {
        this.debugPage();
        this.test.fail("Timeout reached. No update page form ?");
    });
});

/*casper.then(function appdeskPage2() {
 casper.waitFor(function() {
 return this.evaluate(function() {
 return document.title === 'Pages';
 });
 }, function() {
 this.test.assertTextExists('New test page', 'Appdesk Pages is reloaded');
 //this.click('.nos-ostabs-panel:not(.nos-ostabs-hide) .nos-toolbar-left button.primary');
 }, function() {
 this.debugPage();
 this.test.fail("Timeout reached. No Appdesk Pages ?");
 });
 });*/

casper.run(function() {
    this.test.renderResults(true);
});
