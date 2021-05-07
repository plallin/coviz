#!/usr/bin/env python3

# this script only curls and outputs the latest data from the source API
# pipe output to jq for pretty output

import json
import requests

DATE_COL = 'relDate'


### Date

date = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/Covid19_Vaccine_Administration_Text_Date_View/FeatureServer/0/query'
date_query = {
    'f': 'json',
    'where': f"{DATE_COL}>'2020-01-01 00:00:00'", # "Dates>'2020-01-01 00:00:00'",
    'returnGeometry': False,
    'spatialRel': 'esriSpatialRelIntersects',
    'outFields': f'*',
    # 'orderByFields': f'{DATE_COL} asc',
    'resultOffset': 0,
    'resultRecordCount': 32000,
    'resultType': 'standard'
}

res = requests.get(date, params=date_query)
date_data = json.loads(res.text)['features'][0]['attributes']

### Vaccines per providers (no Janssen yet)

data_vax_per_type = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/Covid19_Vaccine_Administration_VaccineTypeHostedView_V2/FeatureServer/0/query'
param_vax_per_type = {
    'f': 'json',
    'where': f"{DATE_COL}>'2020-01-01 00:00:00'", # "Dates>'2020-01-01 00:00:00'",
    'returnGeometry': False,
    'spatialRel': 'esriSpatialRelIntersects',
    'outFields': f'*',
    # 'orderByFields': f'{DATE_COL} asc',
    'resultOffset': 0,
    'resultRecordCount': 32000,
    'resultType': 'standard'
}

res = requests.get(data_vax_per_type, params=param_vax_per_type)
type_data = json.loads(res.text)['features'][0]['attributes']


### Vaccines per type of dose (first, second), cohort, and providers (no Janssen yet)

data_vax_all = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/Covid19_Vaccine_Administration_Hosted_View/FeatureServer/0/query'
param_vax_all_types = {
    'f': 'json',
    'where': f"{DATE_COL}>'2020-01-01 00:00:00'", # "Dates>'2020-01-01 00:00:00'",
    'returnGeometry': False,
    'spatialRel': 'esriSpatialRelIntersects',
    'outFields': f'*',
    # 'orderByFields': f'{DATE_COL} asc',
    'resultOffset': 0,
    'resultRecordCount': 32000,
    'resultType': 'standard'
}

res = requests.get(data_vax_all, params=param_vax_all_types)
vax_data = json.loads(res.text)['features'][0]['attributes']


### save data

data = open("datahub-scrap/data.json", "r").read()
json_data = json.loads(data)
reldate = str(vax_data['relDate'])
json_data['data'][reldate]['Covid19_Vaccine_Administration_Text_Date_View'] = date_data
json_data['data'][reldate]['Covid19_Vaccine_Administration_VaccineTypeHostedView_V2'] = type_data
json_data['data'][reldate]['Covid19_Vaccine_Administration_Hosted_View'] = vax_data


with open('datahub-scrap/data.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=4)