#!/bin/bash

curl -L \
'https://docs.google.com/spreadsheets/d/1iPUugtRdnSPYWMOHKwpUtUbdctwE36gDrJGAkJ-Nfg0/export?format=csv&id=1iPUugtRdnSPYWMOHKwpUtUbdctwE36gDrJGAkJ-Nfg0&gid=0' \
> data.csv

git add data.csv
git commit -m "updated data"
git push origin main