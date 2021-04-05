#!/bin/bash

./update_data.py

git add data.csv
git commit -m "updated data"
git push origin main