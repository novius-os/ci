<?php
define('TINYMCE', realpath(getcwd().'/../../novius-os/static/admin/vendor/tinymce/'));
define('PODIR', getcwd().'/generated/tinymce');

include_once 'lib.php';
include_once '../vendor/poparser.php';

if (is_dir(TINYMCE.'/plugins')) {
    if (!empty($argv[1])) {
        $langs = explode(',', $argv[1]);
    } else {
        $langs = array('fr', 'ja', 'ie', 'ru', 'es');
    }

    foreach ($langs as $lang) {
        mkdir(PODIR.'/'.$lang);
    }

    $msgformat = function ($str) {
        $str = explode("\n", str_replace("\r", '', $str));
        foreach ($str as $i => $s) {
            if ($i > 0) {
                $str[$i - 1] = $str[$i - 1]."\n";
            }
        }
        return $str;
    };

    $write_po = function ($dictionary, $lang, $en, $json) use ($msgformat) {
        $msgs = array();
        foreach ($en as $key => $txt) {
            $msgs[$txt] = array(
                'msgid' => $msgformat($txt),
                'msgstr' => isset($json[$key]) && $json[$key] != $txt ? $msgformat($json[$key]) : '',
            );
        }
        $poparser = new PoParser();
        $poparser->set_entries($msgs);
        $poparser->write(PODIR.'/'.$lang.'/'.$dictionary.'.po');
    };

    $directory = new DirectoryIterator(TINYMCE.'/plugins');
    foreach ($directory as $fileinfo) {
        if (substr($fileinfo->getFilename(), 0, 3) === 'nos') {
            $path = TINYMCE.'/plugins/'.$fileinfo->getFilename();
            $en = extract_file_js($path.'/langs/en.js');

            foreach ($langs as $lang) {
                $json = extract_file_js($path.'/langs/'.$lang.'.js');
                $write_po($fileinfo->getFilename(), $lang, $en, $json);
            }

            if (is_file($path.'/langs/en_dlg.js')) {
                $en = extract_file_js($path.'/langs/en_dlg.js');

                foreach ($langs as $lang) {
                    $json = extract_file_js($path.'/langs/'.$lang.'_dlg.js');
                    $write_po($fileinfo->getFilename().'_dlg', $lang, $en, $json);
                }
            }
        }
    }

    $path = TINYMCE.'/themes/nos/';
    $en = extract_file_js($path.'/langs/en.js');

    foreach ($langs as $lang) {
        $json = extract_file_js($path.'/langs/'.$lang.'.js');
        $write_po('theme', $lang, $en, $json);
    }

    if (is_file($path.'/langs/en_dlg.js')) {
        $en = extract_file_js($path.'/langs/en_dlg.js');

        foreach ($langs as $lang) {
            $json = extract_file_js($path.'/langs/'.$lang.'_dlg.js');
            $write_po('theme_dlg', $lang, $en, $json);
        }
    }
}
