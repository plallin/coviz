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
weekly_data = json.loads(res.text)['features']


### save data

data = open("datahub-scrap/data.json", "r").read()
json_data = json.loads(data)


# apis = [
#     "Covid19_Vaccine_Administration_Text_Date_View",  # retired
#     "Covid19_Vaccine_Administration_VaccineTypeHostedView_V2",  # retired
#     "Covid19_Vaccine_Administration_Hosted_View",  # retired
#     "COVID19_Daily_Vaccination",  # active
#     "COVID19_Weekly_Vaccination_Figures",  # active
# ]

for d in daily_data:
    date = str(d['attributes']['VaccinationDate'])
    json_data['COVID19_Daily_Vaccination']['data'][date] = d['attributes']

for d in weekly_data:
    date = str(d['attributes']['Week'])
    json_data['COVID19_Weekly_Vaccination_Figures']['data'][date] = d['attributes']


with open('datahub-scrap/data.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=4)

