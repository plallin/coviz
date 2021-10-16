#!/usr/bin/env python3

# this script only curls and outputs the latest data from the source API
# pipe output to jq for pretty output

import json
import requests

### Daily vaccination data

date = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/COVID19_Daily_Vaccination/FeatureServer/0/query'
date_query = {
    'f': 'json',
    'where': f"VaccinationDate>'2020-01-01 00:00:00'", # "Dates>'2020-01-01 00:00:00'",
    'returnGeometry': False,
    'spatialRel': 'esriSpatialRelIntersects',
    'outFields': f'*',
    'orderByFields': f'VaccinationDate asc',
    'resultOffset': 0,
    'resultRecordCount': 32000,
    'resultType': 'standard'
}

res = requests.get(date, params=date_query)
daily_data = json.loads(res.text)['features']


## Weekly vaccination data

data_vax_per_type = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/COVID19_Weekly_Vaccination_Figures/FeatureServer/0/query'
param_vax_per_type = {
    'f': 'json',
    'where': f"ExtractDate>'2020-01-01 00:00:00'", # "Dates>'2020-01-01 00:00:00'",
    'returnGeometry': False,
    'spatialRel': 'esriSpatialRelIntersects',
    'outFields': f'*',
    'orderByFields': f'ExtractDate asc',
    'resultOffset': 0,
    'resultRecordCount': 32000,
    'resultType': 'standard'
}

res = requests.get(data_vax_per_type, params=param_vax_per_type)
print(res.text)
weekly_data = json.loads(res.text)['features']


### save data

data = open("datahub-scrap/data.json", "r").read()
json_data = json.loads(data)

for d in daily_data:
    date = str(d['attributes']['VaccinationDate'])
    if date not in json_data['data']:
        json_data['data'][date] = {}
    json_data['data'][date]['COVID19_Daily_Vaccination'] = d['attributes']

for d in weekly_data:
    date = str(d['attributes']['Week'])
    if date not in json_data['data']:
        json_data['data'][date] = {}
    json_data['data'][date]['COVID19_Weekly_Vaccination_Figures'] = d['attributes']


with open('datahub-scrap/data.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=4)