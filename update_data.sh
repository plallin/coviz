#!/bin/bash

git pull --rebase

./update_data.py

./datahub-scrap/scrap.py

git add datahub-scrap/data.json

git add data.csv data-sources/vaccines.csv data-sources/comments.csv
git commit -m "New data as of: `date`"
git push origin main

./fetch_latest_api_data.py
git add datahub-scrap/*.json
git add data.csv data-sources/vaccines.csv data-sources/comments.csv
git commit -m "datahub data dump as of: `date`"
git push origin main