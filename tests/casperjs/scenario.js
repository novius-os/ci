var nos_step = casper.cli.get('nos_step') || '',
    steps = [
        'media',
        'page',
        'blog',
        'new-home',
        'page-del',
        'media-del'
    ],
    i, step;

casper.nosLogin();

for (i = 0; i < steps.length; i++) {
    step = steps[i];
    require('./ci/tests/casperjs/scenario/' + step + '.js').run();

    if (nos_step == step) {
        break;
    }
}

casper.run(function() {
    this.test.done();
    this.test.renderResults(true);
});
