#!/bin/bash

./update_data.py

git add data.csv data-sources/vaccines.csv data-sources/comments.csv
git commit -m "updated data"
git push origin main