<?php

define('CWD', getcwd());

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

    //$dict_files[$dict_name][$cleaned_file] = true;
    //$files_dict[$dict_name][$cleaned_file] = $dict_name;
    $po = file($pathname, FILE_IGNORE_NEW_LINES);
    $po[] = "";

    $msgcomment = array();
    $msgusage = array();
    $msgid = array();
    $msgstr = array();
    foreach ($po as $line) {
        if (empty($line)) {
            // Skip empty msgid (headers)
            $msgid = implode("\n", $msgid);
            if (!empty($msgid)) {
                $msg = array(
                    'str' => implode("\n", $msgstr),
                    'comment' => implode("\n", $msgcomment),
                    'usage' => implode("\n", $msgusage),
                );
                // msgstr will be empty, for sure
                if (empty($found[$cleaned_file][$msgid])) {
                    $found[$cleaned_file][$msgid] = &$msg;
                } else {
                    $usage = $found[$cleaned_file][$msgid]['usage'];
                    $found[$cleaned_file][$msgid]['usage'] .= ($usage ? "\n" : '').$msg['usage'];
                }
                unset($msg);
            }

            $msgcomment = array();
            $msgusage = array();
            $msgid = array();
            $msgstr = array();
        } else {
            $line = str_replace('\\n', '\\\\n', trim($line));
            if (substr($line, 0, 2) == '#.') {
                $msgcomment[] = trim(substr($line, 3));
            }
            if (substr($line, 0, 2) == '#:') {
                $msgusage[] = str_replace(CWD.'/', '', substr($line, 3));
            }
            if (substr($line, 0, 5) == 'msgid') {
                $last = 'msgid';
                $msgid[] = substr(trim(substr($line, 5)), 1, -1);
            }
            if (substr($line, 0, 6) == 'msgstr') {
                $last = 'msgstr';
                $msgstr[] = substr(trim(substr($line, 6)), 1, -1);
            }
            // Multi-line texts
            if (substr($line, 0, 1) == '"' && substr($line, -1) == '"') {
                // Don't trim here!
                ${$last}[0] .= substr($line, 1, -1);
            }
        }
    }
}

function dict_stat($messages)
{
    $stat = array(
        'word_count' => 0,
        'word_count_translated' => 0,
        'msg_count' => count($messages),
        'msg_count_translated' => 0,
    );
    foreach ($messages as $msgid => $msg) {
        $words = count(explode(' ', $msgid));
        $stat['word_count'] += $words;
        if ($msg['str'] != '') {
            $stat['msg_count_translated']++;
            $stat['word_count_translated'] += $words;
        }
    }
    $stat['word_translated_percent'] = sprintf('%0.0d', empty($stat['word_count']) ? 0 : ($stat['word_count_translated'] / $stat['word_count'] * 100));
    $stat['msg_translated_percent'] = sprintf('%0.0d', empty($stat['msg_count']) ? 0 : ($stat['msg_count_translated'] / $stat['msg_count'] * 100));

    $stat['stat_msg'] = $stat['msg_count_translated']." out of ".$stat['msg_count']." messages are translated (".$stat['msg_translated_percent']."%).";
    $stat['stat_word'] = $stat['word_count_translated']." out of ".$stat['word_count']." words are translated (".$stat['msg_translated_percent']."%).";

    return $stat;
}

$sprint_dict_php = function ($dict) {

    $stat = dict_stat($dict);

    $out = "<?php\n\n";
    $out .= "// Generated on ".date('d/m/Y H:i:s')."\n\n";
    $out .= "// ".$stat['stat_msg']."\n";
    $out .= "// ".$stat['stat_word']."\n";
    $out .= "\nreturn array(\n";
    foreach ($dict as $msgid => $msg) {
        if (!empty($msg['comment'])) {
            foreach (explode("\n", $msg['comment']) as $comment) {
                $out .= "    #. ".$comment."\n";
            }
        }
        if (!empty($msg['usage'])) {
            foreach (array_unique(explode("\n", $msg['usage'])) as $usage) {
                $out .= "    #: ".$usage."\n";
            }
        }
        $out .= "    '" . str_replace("'", "\\'", stripslashes($msgid)) . "' => '" . str_replace("'", "\\'", stripslashes($msg['str'])) . "',\n\n";
    }
    $out .= ");\n";
    return $out;
};

$dict = array();
foreach ($found as $dict_name => $messages) {
    $dict_unused = array();
    foreach ($messages as $msgid => $msgstr) {
        // Unused messages will be put at the end
        if (isset($unused[$dict_name][$msgid])) {
            $dict_unused[$msgid] = array('str' => $msgstr, 'comment' => '', 'usage' => '');
            continue;
        }
        if (isset($dicts[$dict_name][$msgid])) {
            // Translation was found in the existing dictionnary
            $found[$dict_name][$msgid]['str'] = $dicts[$dict_name][$msgid];
        }
    }
    if (!empty($dict_unused)) {
        $found[$dict_name]['Unused'] = $dict_unused;
    }
}


echo "\n";

foreach ($found as $dict_name => $messages) {
    file_put_contents($dict_name.'.lang.php', $sprint_dict_php($found[$dict_name]));
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
