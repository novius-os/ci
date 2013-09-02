exports.run = run;
function run() {
    casper.then(function() {
            this.echo('Media tests', 'INFO_BAR');
        })

        .nosAppsTab()

        // Launch Media Centre application
        .nosLaunch('noviusos_media', 'Media Centre')

        // Check Media Centre appdesk is opened
        .nosAppdeskLoad('Media Centre')

        // Click on add a folder
        .then(function() {
            this.waitForText('Add a folder', function() {
                this.clickLabel('Add a folder', 'a');
            }, function() {
                this.nosError('Timeout reached. No "Add a folder" ?');
            });
        })

        // Check Add form is opened
        .nosFormFill('Add a folder', 'admin/noviusos_media/folder/insert_update', {
            medif_title: 'New folder'
        })

        // Submit Add form
        .nosFormSubmit()

        // Check adding is ok, appdesk is reloaded
        .nosFormCheck('New folder')

        // Click to open context menu on page
        .then(function() {
            this.waitForText('Add a media file', function() {
                this.clickLabel('Add a media file', 'span');
            }, function() {
                this.nosError('Timeout reached. No "Add a media file" ?');
            });
        })

        // Check Add form is opened
        .nosFormFill('Add a media file', 'admin/noviusos_media/media/insert_update', {
            media: '/tmp/logo-novius-os.png',
            media_folder_id: 2
        })

        // Submit Add form
        .nosFormSubmit()

        // Check adding is ok, appdesk is reloaded
        .nosFormCheck('Logo Novius Os');
}