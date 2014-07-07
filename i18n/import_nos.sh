#!/bin/bash

source langs.sh

for L in ${NOS_LANGS[@]}; do
    ./import.sh $L
done
