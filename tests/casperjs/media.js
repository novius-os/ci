casper.nosLogin();

// Launch Media Centre application
casper.nosLaunch('noviusos_media', 'Media Centre');

// Check Media Centre appdesk is opened and click on add a folder
casper.nosAppdesk('Media Centre', function() {
    this.clickLabel('Add a folder', 'a');
});

// Check Add form is opened, fill form and submit
casper.nosForm('Add a folder', 'admin/noviusos_media/folder/insert_update', {
    medif_title: 'New folder'
}, 'Add');

// Check adding is ok, appdesk is reloaded, then click to open context menu on page
casper.nosFormOK('New folder', function() {
    this.clickLabel('Add a media file', 'span');
});

// Check Add form is opened, fill form and submit
casper.nosForm('Add a media file', 'admin/noviusos_media/media/insert_update', {
    media: '/tmp/logo-novius-os.png',
    media_folder_id: 2
}, 'Add');

// Check adding is ok, appdesk is reloaded
casper.nosFormOK('Logo Novius Os');

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
