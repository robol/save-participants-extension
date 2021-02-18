#!/bin/bash

set -e

FILES="background.js contentscript.js COPYING get-call.js manifest.json popup.html popup.js README.md images/*"

VERSION=$(grep \"version\" manifest.json  | cut -d ':' -f2 | cut -d '"' -f2)
FILENAME="save-participants-${VERSION}.zip"

VERSION_POPUP=$(grep "Save participants v" popup.html | cut -d 'v' -f3 | cut -d '<' -f1)


echo -e "\033[32;1m###\033[0m Version found in manifest.json: \033[1m${VERSION}\033[0m"
echo -e "\033[32;1m###\033[0m Version found in popup.html: \033[1m${VERSION_POPUP}\033[0m"

echo -e "\033[32;1m###\033[0m Creating \033[1m${FILENAME}\033[0m"

zip -q -r "${FILENAME}" ${FILES}

echo -e "\033[32;1m###\033[0m done"

