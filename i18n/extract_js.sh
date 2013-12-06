#!/bin/bash

rm -r generated/tinymce 2> /dev/null
mkdir generated/tinymce
php extract_js.php

