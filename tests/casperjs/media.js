casper.nosLogin();

// Launch Media Centre application
casper.nosLaunch('noviusos_media', 'Media Centre');

// Check Media Centre appdesk is opened
casper.nosAppdeskLoad('Media Centre');

// Click on add a folder
casper.then(function() {
    this.clickLabel('Add a folder', 'a');
});

// Check Add form is opened
casper.nosFormFill('Add a folder', 'admin/noviusos_media/folder/insert_update', {
    medif_title: 'New folder'
});

// Submit Add form
casper.nosFormSubmit();

// Check adding is ok, appdesk is reloaded
casper.nosFormCheck('New folder');

// Click to open context menu on page
casper.then(function() {
    this.clickLabel('Add a media file', 'span');
});

// Check Add form is opened
casper.nosFormFill('Add a media file', 'admin/noviusos_media/media/insert_update', {
    media: '/tmp/logo-novius-os.png',
    media_folder_id: 2
});

// Submit Add form
casper.nosFormSubmit();

// Check adding is ok, appdesk is reloaded
casper.nosFormCheck('Logo Novius Os');

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
