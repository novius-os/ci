<?php
define('CWD', getcwd());
define('TINYMCE', realpath(CWD.'/../../../novius-os/static/admin/vendor/tinymce/'));
define('LANG', $argv[1]);

include_once 'lib.php';
include_once __DIR__.'/../vendor/poparser.php';

$directory = new DirectoryIterator(TINYMCE.'/plugins');
foreach ($directory as $fileinfo) {
    if (substr($fileinfo->getFilename(), 0, 3) === 'nos') {
        $path = TINYMCE.'/plugins/'.$fileinfo->getFilename();
        $en = extract_file_js($path.'/langs/en.js');

        $pathname = CWD.'/tinymce/'.LANG.'/'.$fileinfo->getFilename().'.po';
        if (is_file($pathname)) {
            $poparser = new PoParser();
            $po = $poparser->read($pathname);

            file_put_contents(CWD.'/tinymce/'.LANG.'/'.$fileinfo->getFilename().'.js', sprint_dict_js($po, $en, $fileinfo->getFilename(), LANG));
        }

        $pathname = CWD.'/tinymce/'.LANG.'/'.$fileinfo->getFilename().'_dlg.po';
        if (is_file($path.'/langs/en_dlg.js') && is_file($pathname)) {
            $en = extract_file_js($path.'/langs/en_dlg.js');

            $poparser = new PoParser();
            $po = $poparser->read($pathname);

            file_put_contents(CWD.'/tinymce/'.LANG.'/'.$fileinfo->getFilename().'_dlg.js', sprint_dict_js($po, $en, $fileinfo->getFilename().'_dlg', LANG));
        }
    }
}

$path = TINYMCE.'/themes/nos/';
$en = extract_file_js($path.'/langs/en.js');

$pathname = CWD.'/tinymce/'.LANG.'/theme.po';
if (is_file($pathname)) {
    $poparser = new PoParser();
    $po = $poparser->read($pathname);

    file_put_contents(CWD.'/tinymce/'.LANG.'/'.'theme.js', sprint_dict_js($po, $en, 'theme', LANG));
}

$pathname = CWD.'/tinymce/'.LANG.'/theme_dlg.po';
if (is_file($path.'/langs/en_dlg.js') && is_file($pathname)) {
    $en = extract_file_js($path.'/langs/en_dlg.js');

    $poparser = new PoParser();
    $po = $poparser->read($pathname);

    file_put_contents(CWD.'/tinymce/'.LANG.'/'.'theme_dlg.js', sprint_dict_js($po, $en, 'theme_dlg', LANG));
}
