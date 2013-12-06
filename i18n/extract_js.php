<?php
define('TINYMCE', realpath(getcwd().'/../../novius-os/static/admin/vendor/tinymce/'));
define('PODIR', getcwd().'/generated/tinymce');

include_once 'lib.php';
include_once '../vendor/poparser.php';

if (is_dir(TINYMCE.'/plugins')) {
    $langs = array('fr', 'ja', 'ie', 'ru', 'es');

    foreach ($langs as $lang) {
        mkdir(PODIR.'/'.$lang);
    }

    $extract_file = function ($file) {
        if (!is_file($file)) {
            return array();
        }
        $content = file_get_contents($file);
        $start = strpos($content, '{');
        $content = substr($content, $start, strrpos($content, '}') - $start + 1);
        $return = json_decode($content, true);
        $error = json_last_error();
        if ($error) {
            echo 'error on json decode: '.$error."\n";
            print_r($content);
            echo "\n";
        }
        return $return;
    };

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
            $en = $extract_file($path.'/langs/en.js');

            foreach ($langs as $lang) {
                $json = $extract_file($path.'/langs/'.$lang.'.js');
                $write_po($fileinfo->getFilename(), $lang, $en, $json);
            }

            if (is_file($path.'/langs/en_dlg.js')) {
                $en = $extract_file($path.'/langs/en_dlg.js');

                foreach ($langs as $lang) {
                    $json = $extract_file($path.'/langs/'.$lang.'_dlg.js');
                    $write_po($fileinfo->getFilename().'_dlg', $lang, $en, $json);
                }
            }
        }
    }

    $path = TINYMCE.'/themes/nos/';
    $en = $extract_file($path.'/langs/en.js');

    foreach ($langs as $lang) {
        $json = $extract_file($path.'/langs/'.$lang.'.js');
        $write_po('theme', $lang, $en, $json);
    }

    if (is_file($path.'/langs/en_dlg.js')) {
        $en = $extract_file($path.'/langs/en_dlg.js');

        foreach ($langs as $lang) {
            $json = $extract_file($path.'/langs/'.$lang.'_dlg.js');
            $write_po('theme_dlg', $lang, $en, $json);
        }
    }
}
