<?php
include_once '../vendor/poparser.php';

define('CWD', getcwd().'/po');
define('LANG', $argv[1]);

$nplural = array(
    'fr' => 2,
    'ja' => 1,
    'ru' => 4,
);

// Load i18n configuration file
$config = is_file(CWD.'/lang/config.php') ? include CWD.'/lang/config.php' : array();
$config =  $config + array(
    'dictionaries' => array(
        'default' => false,
    ),
);

$dict_rules = $config['dictionaries'];

$dicts = array();
$found = array();
$all = array();

// Retrieve existing translations from the lang directory
if (is_dir(CWD.'/lang/'.LANG)) {
    $directory = new RecursiveDirectoryIterator(CWD.'/lang/'.LANG);
    $files = new RecursiveIteratorIterator($directory);
    foreach ($files as $file) {
        $filename =  $file->getFilename();
        if (substr($filename, -4) != '.php') {
            continue;
        }
        $pathname = $file->getPathname();
        $dict_name = substr(str_replace('.lang.php', '.php', str_replace(CWD.'/lang/'.LANG.'/', '', $pathname)), 0, -4);

        $dicts[$dict_name] = include $pathname;

        // Keep a track of all translations and which dictionary they come from
        foreach ($dicts[$dict_name] as $msgid => $msgstr) {
            if (!empty($all[$msgid][0])) {
                continue;
            }
            $all[$msgid] = array($msgstr, $dict_name);
        }
    }
}

// Populate translations in-between dictionaries (when a translation is found in A but is empty in B, it's copied)
foreach ($all as $msgid => $msg) {
    list($msgstr, ) = $msg;
    if (empty($msgstr)) {
        continue;
    }
    foreach ($dicts as $dict_name => $msg) {
        if (isset($msg[$msgid]) && $msg[$msgid] === '') {
            $dicts[$dict_name][$msgid] = $msgstr;
        }
    }
}

// Creates the 'all' dictionary
$dicts['all'] = $all;
$all = array();

// Retrieve translations found in the source code
$directory = new RecursiveDirectoryIterator(CWD);
$files = new RecursiveIteratorIterator($directory);
$current = '';
foreach ($files as $file) {
    // Read only from .po files
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


    $poparser = new PoParser();
    $po = $poparser->read($pathname);
    foreach ($po as $entry) {
        // Skip empty msgid (headers)
        if (isset($entry['msgid']) && !empty($entry['msgid'])) {
            if (is_array($entry['msgid'])) {
                $entry['msgid'] = $entry['msgid'][0];
            }
            $msgid = $entry['msgid'];

            if (isset($entry['reference'])) {
                foreach ($entry['reference'] as $i => $ref) {
                    $entry['reference'][$i] = str_replace(CWD.'/', '', $entry['reference'][$i]);
                }
            }

            if (empty($found[$dict_name][$msgid])) {
                $found[$dict_name][$msgid] = $entry;
                $all[$msgid] = $entry;
            } else {
                // msgid used in another file, merge ccomment and reference
                if (isset($entry['reference'])) {
                    $reference = isset($found[$dict_name][$msgid]['reference']) ?
                        (array) $found[$dict_name][$msgid]['reference'] :
                        array();
                    $found[$dict_name][$msgid]['reference'] = array_merge($reference, (array) $entry['reference']);
                    $all[$msgid]['reference'] = array_merge($reference, (array) $entry['reference']);
                }

                if (isset($entry['ccomment'])) {
                    $ccomment = isset($found[$dict_name][$msgid]['ccomment']) ?
                        (array) $found[$dict_name][$msgid]['ccomment'] :
                        array();
                    $found[$dict_name][$msgid]['ccomment'] = array_merge($ccomment, (array) $entry['ccomment']);
                    $all[$msgid]['ccomment'] = array_merge($ccomment, (array) $entry['ccomment']);
                }
            }
        }
    }
}


// Retrieve metadata translations
// We translate manually metadata into french, which is the base file where to find metadata strings
if (LANG != 'en' && is_file(CWD.'/lang/fr/metadata.lang.php')) {
    $metadata = include CWD.'/lang/fr/metadata.lang.php';
    $merge = is_file(CWD.'/lang/'.LANG.'/metadata.lang.php') ? include CWD.'/lang/'.LANG.'/metadata.lang.php' : array();
    $found['metadata'] = array();

    // Except the french translations are incorrect, we want the ones for the current lang
    foreach (array_keys($metadata) as $key) {
        $found['metadata'][$key] = array(
            'msgid' => $key,
            'msgstr' => !empty($merge[$key]) ? $merge[$key] : '',
            'reference' => array(),
            'ccomment' => array(),
        );
    }
}

// Compute unused translations (previously in a dictionary, but not found in the source code anymore).
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
                $unused[$msgid] = array(
                    'msgid' => $msgid,
                    'msgstr' => $msgstr,
                    'ccomment' => array(),
                    'reference' => array($msgusage),
                );
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
        if (isset($msg['msgid_plural'])) {
            foreach ($msg['msgstr'] as $msgstr) {
                if (!empty($msgstr)) {
                    $stat['msg_count_translated']++;
                    $stat['word_count_translated'] += $words;
                }
                break;
            }
        } else {
            if (!empty($msg['msgstr'])) {
                $stat['msg_count_translated']++;
                $stat['word_count_translated'] += $words;
            }
        }
    }
    $stat['word_translated_percent'] = sprintf('%0.0d', empty($stat['word_count']) ? 0 : ($stat['word_count_translated'] / $stat['word_count'] * 100));
    $stat['msg_translated_percent'] = sprintf('%0.0d', empty($stat['msg_count']) ? 0 : ($stat['msg_count_translated'] / $stat['msg_count'] * 100));

    $stat['stat_msg'] = $stat['msg_count_translated']." out of ".$stat['msg_count']." messages are translated (".$stat['msg_translated_percent']."%).";
    $stat['stat_word'] = $stat['word_count_translated']." out of ".$stat['word_count']." words are translated (".$stat['msg_translated_percent']."%).";

    return $stat;
}

$sprint_dict_php = function ($dict) use ($nplural) {

    $stat = dict_stat($dict);

    $out = "<?php\n\n";
    $out .= "// Generated on ".date('d/m/Y H:i:s')."\n\n";
    $out .= "// ".$stat['stat_msg']."\n";
    $out .= "// ".$stat['stat_word']."\n";
    $out .= "\nreturn array(\n";
    foreach ($dict as $msgid => $msg) {
        if (!empty($msg['ccomment'])) {
            foreach ((array) $msg['ccomment'] as $comment) {
                $out .= "    #. ".$comment."\n";
            }
        }
        if (!empty($msg['reference'])) {
            foreach (array_unique((array) $msg['reference']) as $usage) {
                $out .= "    #: ".$usage."\n";
            }
        }
        if (isset($msg['msgid_plural'])) {
            $out .= "    '" . str_replace("'", "\\'", stripslashes($msgid)) . "' => array(\n";
            for ($i = 0; $i < $nplural[LANG]; $i++) {
                $msgstr = isset($msg['msgstr'][$i]) ? $msg['msgstr'][$i] : '';
                $out .= "        " . $i . " => '" . str_replace("'", "\\'", stripslashes($msgstr)) . "',\n";
            }
            $out .= "    ),\n\n";
        } else if (!empty($msg['msgid'])) {
            $msgstr = is_array($msg['msgstr']) ? $msg['msgstr'][0] : $msg['msgstr'];
            $out .= "    '" . str_replace("'", "\\'", stripslashes($msgid)) . "' => '" . str_replace("'", "\\'", stripslashes($msgstr)) . "',\n\n";
        }
    }
    $out .= ");\n";
    return $out;
};

is_dir('lang') || mkdir('lang');
is_dir('lang/'.LANG) || mkdir('lang/'.LANG);

// Fill in dictionaries with existing translations
$dict = array();
foreach ($found as $dict_name => $messages) {
    $dict_unused = array();
    foreach ($messages as $msgid => $msgstr) {
        // Unused messages will be put at the end
        if (isset($unused[$dict_name][$msgid])) {
            $dict_unused[$msgid] = array(
                'msgid' => $msgid,
                'msgstr' => $msgstr,
                'ccomment' => array(),
                'reference' => array(),
            );
            continue;
        }

        if (isset($found[$dict_name][$msgid]['msgid_plural'])) {
            if (isset($dicts[$dict_name][$msgid]) && !empty($dicts[$dict_name][$msgid])) {
                // Translation was found in the existing dictionary
                $found[$dict_name][$msgid]['msgstr'] = (array) $dicts[$dict_name][$msgid];
            } else if (isset($dicts['all'][$msgid]) && !empty($dicts['all'][$msgid][0])) {
                // Fetch translation from the 'all' dictionary (allow to move translations from a dict to another one)
                $found[$dict_name][$msgid]['msgstr'] = (array) $dicts['all'][$msgid][0];
            }
            $found[$dict_name][$msgid]['msgstr'] = (array) $found[$dict_name][$msgid]['msgstr'];

            // In plural case, fill msgstr depend plural number for the language
            for ($i = 0; $i < $nplural[LANG]; $i++) {
                if (!isset($found[$dict_name][$msgid]['msgstr'][$i])) {
                    $found[$dict_name][$msgid]['msgstr'][$i] = '';
                }
            }

            if (isset($found[$dict_name][$msgid]['msgstr'][1]) && empty($found[$dict_name][$msgid]['msgstr'][1])) {
                // If first plural form is empty, search in dictionaries for an existing translation
                // Maybe, two translations has been merged for make one plural translation
                $msgid_plural = $found[$dict_name][$msgid]['msgid_plural'];
                $msgid_plural = is_array($msgid_plural) ? $msgid_plural[0] : $msgid_plural;
                if (isset($dicts[$dict_name][$msgid_plural]) && !empty($dicts[$dict_name][$msgid_plural])) {
                    $found[$dict_name][$msgid]['msgstr'][1] = $dicts[$dict_name][$msgid_plural];
                } else if (isset($dicts['all'][$msgid_plural]) && !empty($dicts['all'][$msgid_plural][0])) {
                    $found[$dict_name][$msgid]['msgstr'][1] = $dicts['all'][$msgid_plural][0];
                }
                unset($unused[$msgid_plural]);
            }
        } else {
            if (isset($dicts[$dict_name][$msgid]) && $dicts[$dict_name][$msgid] != '') {
                // Translation was found in the existing dictionary
                $found[$dict_name][$msgid]['msgstr'] = $dicts[$dict_name][$msgid];
            } else if (isset($dicts['all'][$msgid]) && $dicts['all'][$msgid][0] != '') {
                // Fetch translation from the 'all' dictionary (allow to move translations from a dict to another one)
                $found[$dict_name][$msgid]['msgstr'] = $dicts['all'][$msgid][0];
            }
        }
    }
    if (!empty($dict_unused)) {
        $found[$dict_name]['Unused'] = $dict_unused;
    }
}

// Write dictionary files
foreach ($found as $dict_name => $messages) {
    if (empty($found[$dict_name])) {
        return;
    }

    file_put_contents('lang/'.LANG.'/'.$dict_name.'.lang.php', $sprint_dict_php($found[$dict_name]));
    $poparser = new PoParser();
    $poparser->set_entries($found[$dict_name]);
    $poparser->write('lang/'.LANG.'/'.$dict_name.'.po');
}

if (!empty($unused)) {
    file_put_contents('lang/'.LANG.'/unused.lang.php', $sprint_dict_php($unused));
    $poparser = new PoParser();
    $poparser->set_entries($unused);
    $poparser->write('lang/'.LANG.'/unused.po');
}


// Write stats
$stats = array(
    'word_count' => 0,
    'word_count_translated' => 0,
    'msg_count' => 0,
    'msg_count_translated' => 0,
);
foreach ($found as $dict_name => $messages) {
    if (empty($found[$dict_name])) {
        return;
    }

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

$width = 50;
printf("  %s [%-{$width}s] %3s%%\n", LANG, str_repeat('-', $stats['word_translated_percent'] / 100 * $width), $stats['word_translated_percent']);

if (!empty($argv[2])) {

    $dict = 'dict ->';
    $max = 0;
    foreach ($found as $dict_name => $messages) {
        $max = max($max, strlen($dict_name));
    }
    foreach ($found as $dict_name => $messages) {
        $stat = dict_stat($messages);
        printf("  $dict %-{$max}s: %s words\n", $dict_name, $stat['word_count']);
        $dict = '       ';
    }
}
