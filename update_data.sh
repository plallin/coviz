#!/bin/bash

git pull --rebase

./update_data.py

git add data.csv data-sources/vaccines.csv data-sources/comments.csv
git commit -m "New data as of: `date`"
git push origin main