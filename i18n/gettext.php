<?php

define('CWD', getcwd().'/po');
define('LANG', $argv[1]);

function __($msg)
{
    return $msg;
}

if (!empty($argv[2])) {
    $dict_rules = include $argv[2];
} else {
    $dict_rules = array(
        'default' => false,
    );
}

// Retrieve existing translations from the lang directory
$directory = new RecursiveDirectoryIterator(CWD.'/lang/'.LANG);
$files = new RecursiveIteratorIterator($directory);
$dicts = array();
$all = array();
foreach ($files as $file) {
    $filename =  $file->getFilename();
    if (substr($filename, -4) != '.php') {
        continue;
    }
    $pathname = $file->getPathname();
    $dict_name = substr(str_replace('.lang.php', '.php', str_replace(CWD.'/lang/'.LANG.'/', '', $pathname)), 0, -4);
    $dicts[$dict_name] = include $pathname;
    foreach ($dicts[$dict_name] as $msgid => $msgstr) {
        if (empty($all[$msgid])) {
            $all[$msgid] = array($msgstr, $dict_name);
        }
    }
}
$dicts['all'] = $all;

// Retrieve translations found in the source code
$directory = new RecursiveDirectoryIterator(CWD);
$files = new RecursiveIteratorIterator($directory);
$found = array();
$all = array();
$current = '';
foreach ($files as $file) {
    $filename =  $file->getFilename();
    if (substr($filename, -3) != '.po') {
        continue;
    }

    $pathname = $file->getPathname();
    $cleaned_file = str_replace(CWD.'/', '', $pathname);
    if (preg_match('`lang/`', $cleaned_file)) {
        continue;
    }
    foreach ($dict_rules as $dict_name => $rules) {
        if (empty($rules)) {
            break;
        }
        foreach ($rules as $rule) {
            if (preg_match("`$rule`", $cleaned_file)) {
                // We found the dictionnary
                break 2;
            }
        }
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
                if (empty($found[$dict_name][$msgid])) {
                    $found[$dict_name][$msgid] = &$msg;
                    $all[$msgid] = &$msg;
                } else {
                    $usage = $found[$dict_name][$msgid]['usage'];
                    $found[$dict_name][$msgid]['usage'] .= ($usage ? "\n" : '').$msg['usage'];
                    $all[$msgid]['usage']   .= ($usage ? "\n" : '').$msg['usage'];
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

$unused = array();
foreach ($dicts as $dict_name => $messages) {
    foreach ($messages as $msgid => $msgstr) {
        if (!isset($all[$msgid])) {
            if ($dict_name == 'all') {
                list($msgstr, $msgusage) = $msgstr;
            } else {
                $msgusage = $dict_name;
            }
            if ($msgusage != 'metadata') {
                $unused[$msgid] = array('str' => $msgstr, 'comment' => '', 'usage' => $msgusage);
            }
        }

        if (!isset($found[$dict_name][$msgid]) && $dict_name != 'all') {
            // Don't re-write old strings that no longer appear in the code
            //$found[$dict_name][$msgid] = array('str' => $msgstr, 'comment' => 'Overwritten', 'usage' => '');
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

    echo '      '.$stat['stat_msg']."\n";
    echo '      '.$stat['stat_word']."\n\n";

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

$sprint_dict_po = function ($dict) {

    $stat = dict_stat($dict);

    echo '      '.$stat['stat_msg']."\n";
    echo '      '.$stat['stat_word']."\n\n";

    $out = "\n";
    $out .= "# Generated on ".date('d/m/Y H:i:s')."\n\n";
    $out .= "# ".$stat['stat_msg']."\n";
    $out .= "# ".$stat['stat_word']."\n";
    $out .= "\n\n";
    foreach ($dict as $msgid => $msg) {
        if (!empty($msg['comment'])) {
            foreach (explode("\n", $msg['comment']) as $comment) {
                $out .= "#. ".$comment."\n";
            }
        }
        if (!empty($msg['usage'])) {
            foreach (array_unique(explode("\n", $msg['usage'])) as $usage) {
                $out .= "#: ".$usage."\n";
            }
        }
        $out .= 'msgid "' . str_replace('"', '\\"', stripslashes($msgid)) . '"'."\n";
        $out .= 'msgstr "' . str_replace('"', '\\"', stripslashes($msg['str'])) . '"'."\n\n";
    }
    $out .= "\n";
    return $out;
};


is_dir('lang') || mkdir('lang');
is_dir('lang/'.LANG) || mkdir('lang/'.LANG);

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
    if (empty($found[$dict_name])) {
        return;
    }
    echo "   $dict_name:\n";
    file_put_contents('lang/'.LANG.'/'.$dict_name.'.lang.php', $sprint_dict_php($found[$dict_name]));
    file_put_contents('lang/'.LANG.'/'.$dict_name.'.po', $sprint_dict_po($found[$dict_name]));
}

if (!empty($unused)) {
    echo "   'unused'\n";
    file_put_contents('lang/'.LANG.'/unused.lang.php', $sprint_dict_php($unused));
    file_put_contents('lang/'.LANG.'/unused.po', $sprint_dict_po($unused));
}


$stats = array(
    'word_count' => 0,
    'word_count_translated' => 0,
    'msg_count' => 0,
    'msg_count_translated' => 0,
);
foreach ($found as $dict_name => $messages) {
    $stat = dict_stat($messages);
    $stats['word_count'] += $stat['word_count'];
    $stats['word_count_translated'] += $stat['word_count_translated'];
    $stats['msg_count'] += $stat['msg_count'];
    $stats['msg_count_translated'] += $stat['msg_count_translated'];

    $stats['word_translated_percent'] = sprintf('%0.0d', $stats['word_count_translated'] / $stats['word_count'] * 100);
    $stats['msg_translated_percent'] = sprintf('%0.0d', $stats['msg_count_translated'] / $stats['msg_count'] * 100);

    $stats['stat_msg'] = $stats['msg_count_translated']." out of ".$stats['msg_count']." messages are translated (".$stats['msg_translated_percent']."%).";
    $stats['stat_word'] = $stats['word_count_translated']." out of ".$stats['word_count']." words are translated (".$stats['msg_translated_percent']."%).";
}

echo "\n";
echo "   TOTAL:\n";
echo "      ".$stats['stat_msg']."\n";
echo "      ".$stats['stat_word']."\n";

echo "\n";
echo "   SIZE:\n";
$max = 0;
foreach ($found as $dict_name => $messages) {
    $stat = dict_stat($messages);
    $max = max($max, $stat['word_count']);
}

// Maximum width should be approx 40 letters
if ($max > 0) {
    $div = ceil($max / 40);
    foreach ($found as $dict_name => $messages) {
        $stat = dict_stat($messages);
        printf("   %13s: %s\n", $dict_name, str_repeat('=', round($stat['word_count'] / $div)));
    }
    echo "\n";
}


/*
file_put_contents('lang/all.php', var_export(array(
    //'missing' => $missing,
    'unused' => $unused,
    'existing (dicts)' => $dicts,
    'found' => $found,
), true));
*/

