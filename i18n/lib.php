<?php

function nplural($lang)
{
    $nplural = array(
        'fr' => 2,
        'ja' => 1,
        'ru' => 4,
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

function sprint_dict_php($dict)
{

    $stat = dict_stat($dict);
    $nplural = nplural(LANG);

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
};
