<?php

function nplural($lang)
{
    $nplural = array(
        'fr' => 2,
        'ja' => 1,
        'ru' => 3,
        'ie' => 2,
        'es' => 2,
    );

    return isset($nplural[$lang]) ? $nplural[$lang] : 2;
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

function sprint_dict_php($dict, $lang)
{

    $stat = dict_stat($dict);
    $nplural = nplural($lang);

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
            for ($i = 0; $i < $nplural; $i++) {
                $msgstr = isset($msg['msgstr'][$i]) ? $msg['msgstr'][$i] : '';
                $out .= "        " . $i . " => '" . str_replace("'", "\\'", stripslashes($msgstr)) . "',\n";
            }
            $out .= "    ),\n\n";
        } else if (!empty($msg['msgid'])) {
            $msgstr = is_array($msg['msgstr']) ? implode('', $msg['msgstr']) : $msg['msgstr'];
            $out .= "    '" . str_replace("'", "\\'", stripslashes($msgid)) . "' => '" . str_replace("'", "\\'", stripslashes($msgstr)) . "',\n\n";
        }
    }
    $out .= ");\n";
    return $out;
}

function extract_file_js($file)
{
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
}


function sprint_dict_js($po, $en, $name, $lang)
{
    $out = "tinyMCE.addI18n('".$lang.'.'.str_replace('theme', 'advanced', $name)."', ";
    $json = array();
    foreach ($en as $key => $value) {
        $en[$key] =str_replace("\r", '', $value);
    }
    foreach ($po as $entry) {
        // Skip empty msgid (headers)
        if (isset($entry['msgid']) && !empty($entry['msgid'])) {
            if (is_array($entry['msgid'])) {
                $entry['msgid'] = implode('', $entry['msgid']);
            }
            $msgid = $entry['msgid'];
            $msgstr = is_array($entry['msgstr']) ? implode('', $entry['msgstr']) : $entry['msgstr'];
            $key = array_search($msgid, $en);
            if ($key) {
                $json[$key] = $msgstr;
            }
        }
    }
    $out .= str_replace(array('{', '","', '}'), array("{\n", "\",\n\"", "\n}"), json_encode($json)).");\n";
    return $out;
}
