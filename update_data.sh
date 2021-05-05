#!/bin/bash

git pull --rebase

./update_data.py

./datahub-scrap/scrap.py

git add datahub-scrap/data.json

git add data.csv data-sources/vaccines.csv data-sources/comments.csv
git commit -m "New data as of: `date`"
git push origin main