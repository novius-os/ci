<?php
define('CWD', getcwd());
define('LANG', $argv[1]);

include_once 'lib.php';
include_once __DIR__.'/../vendor/poparser.php';

// Retrieve translations found in the source code
$directory = new RecursiveDirectoryIterator(CWD);
$files = new RecursiveIteratorIterator($directory);
$found = array();
$current = '';
foreach ($files as $file) {
    $filename =  $file->getFilename();
    if (substr($filename, -3) != '.po') {
        continue;
    }

    $pathname = $file->getPathname();
    $cleaned_file = str_replace(CWD.'/', '', $pathname);
    $cleaned_file = str_replace('.po', '', $pathname);
    if (preg_match('`lang/`', $cleaned_file)) {
        continue;
    }

    $poparser = new PoParser();
    $po = $poparser->read($pathname);
    foreach ($po as $entry) {
        // Skip empty msgid (headers)
        if (isset($entry['msgid']) && !empty($entry['msgid'])) {
            if (is_array($entry['msgid'])) {
                $entry['msgid'] = implode('', $entry['msgid']);
            }
            $msgid = $entry['msgid'];

            $found[$cleaned_file][$msgid] = $entry;
        }
    }
}

echo "\n";

foreach ($found as $dict_name => $messages) {
    file_put_contents($dict_name.'.lang.php', sprint_dict_php($found[$dict_name]));
}

$dicts = array();
foreach ($found as $dict_name => $messages) {
    $stat = dict_stat($messages);
    list($app, $lang, $file) = explode('/', str_replace(CWD.'/', '', $dict_name).'/', 3);
    if (substr($app, 0, 7) == 'unused_') {
        continue;
    }
    $dicts[] = array(
        'app' => $app,
        'lang' => $lang,
        'file' => rtrim($file, '/'),
        'stat' => $stat,
    );
}

$width = 50;
$max_app = 0;
$max_file = 0;
foreach ($dicts as $name => $dict) {
    $max_app = max($max_app, strlen($dict['app']));
    $max_file = max($max_file, strlen($dict['file']));
}

$current_app = '';
$current_lang = '';
foreach ($dicts as $dict) {
    // App
    if ($current_app != $dict['app']) {
        $current_app = $dict['app'];
        printf("\n%-{$max_app}s", $current_app);
    } else {
        printf("% {$max_app}s", '');
    }

    echo '  ';

    // Lang
    if ($current_lang != $dict['lang']) {
        $current_lang = $dict['lang'];
        echo $current_lang;
    } else {
        echo '  ';
    }

    echo '  ';

    // File
    printf("%-{$max_file}s", $dict['file']);

    // Percentage
    printf("  [%-{$width}s] %3s%%\n", str_repeat('-', $dict['stat']['word_translated_percent'] / 100 * $width), $dict['stat']['word_translated_percent']);
}
