#!/bin/bash

ROOT=$(pwd)

# Generating .po files into the 'po' dir
rm -r po 2> /dev/null
mkdir po

# Copy app files into the 'po' dir
cd $ROOT/$1

tar cfz $ROOT/po/novius-os.tar.gz \
  --exclude .git \
  --exclude .git* \
  --exclude *.png \
  --exclude *.gif \
  --exclude *.jpg \
  --exclude *.js \
  --exclude *.css \
  --exclude applications \
  --exclude htdocs \
  --exclude static \
  --exclude vendor \
  .

cd $ROOT/po
tar xfz novius-os.tar.gz
rm novius-os.tar.gz

# Extract .po files from the .php source files
echo -n "  -> extracting "

FILES=`find $ROOT/po -type f`

# Saves stdout into file descriptor #6, then disable stdout
exec 6>&1
exec 1>/dev/null 2>&1

GENERATED_PO=0

for FILE in $FILES
do
	# Replace occurrences of translating functions with native gettext's _() one.
	perl -pi -e 's/n__\(/ngettext\(/g;; ' $FILE;
	perl -pi -e 's/\$i18n\(/_\(/g;; ' $FILE;
	perl -pi -e 's/static::i18n\(/_\(/g;; ' $FILE;
	perl -pi -e 's/\$this->i18n\(/_\(/g;; ' $FILE;
	perl -pi -e 's/___\([^,]+,\s*/_\(/g;; ' $FILE;
	perl -pi -e 's/__\(/_\(/g;; ' $FILE;
    # removes header licence (8 lines)
    # $/="" means empty line separator (the whole file will be treated as a single line). Useful because of the multi-line regexp.
	perl -pi -e 'BEGIN {$/="";} s#(<\?php[\s\n\r]+/\*(.*?)\*/)#<?php\n\n\n\n\n\n\n\n#s'  $FILE;

	# Extract translations
    # -Lphp = PHP language
    # -c    = fetch comments
    # -i    = indent the .po file
    # -s    = sort output
    # -o    = write output to specified file
    # --no-wrap     = do not break long lines
    # --omit-header = don't write header with 'msgid ""' entry
	xgettext -Lphp -c --no-wrap -i --from-code=utf-8 -o $FILE.po $FILE;

    if [ -f $FILE.po ]
    then
        ((GENERATED_PO++))

        # Restore stdout, output a dot, disable stdout again
        exec 1<&6 2<&1
        echo -n "."
        exec 1>/dev/null 2>&1
    fi
done

# Restore stdout and close file descriptor #6
exec 1<&6 2<&1 6<&-

echo " $GENERATED_PO .po files generated"

# Cleanup
cd $ROOT
