#!/usr/bin/env python3

# this script only curls and outputs the latest data from the source API
# pipe output to jq for pretty output

import json
import requests

DATE_COL = 'relDate'
data_vax_per_type = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/Covid19_Vaccine_Administration_VaccineTypeHostedView_V2/FeatureServer/0/query'
param_vax_per_type = {
    'f': 'json',
    'where': f"{DATE_COL}>'2020-01-01 00:00:00'", # "Dates>'2020-01-01 00:00:00'",
    'returnGeometry': False,
    'spatialRel': 'esriSpatialRelIntersects',
    'outFields': f'{DATE_COL},az,janssen,modern,pf',
    # 'orderByFields': f'{DATE_COL} asc',
    'resultOffset': 0,
    'resultRecordCount': 32000,
    'resultType': 'standard'
}

res = requests.get(data_vax_per_type, params=param_vax_per_type)
json_data = json.loads(res.text)
print(json_data)

req = res.request
command = "curl -X {method} -H {headers} -d '{data}' '{uri}'"
method = req.method
uri = req.url
data = req.body
headers = ['"{0}: {1}"'.format(k, v) for k, v in req.headers.items()]
headers = " -H ".join(headers)
print(command.format(method=method, headers=headers, data=data, uri=uri))

data_vax_all = 'https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/Covid19_Vaccine_Administration_Hosted_View/FeatureServer/0/query'
param_vax_all_types = {
    'f': 'json',
    'where': f"{DATE_COL}>'2020-01-01 00:00:00'", # "Dates>'2020-01-01 00:00:00'",
    'returnGeometry': False,
    'spatialRel': 'esriSpatialRelIntersects',
    'outFields': f'{DATE_COL},totalAdministered,firstDose,secondDose,az,modern,pf',
    # 'orderByFields': f'{DATE_COL} asc',
    'resultOffset': 0,
    'resultRecordCount': 32000,
    'resultType': 'standard'
}

res = requests.get(data_vax_all, params=param_vax_all_types)
json_data = json.loads(res.text)
print(json_data)

req = res.request
command = "curl -X {method} -H {headers} -d '{data}' '{uri}'"
method = req.method
uri = req.url
data = req.body
headers = ['"{0}: {1}"'.format(k, v) for k, v in req.headers.items()]
headers = " -H ".join(headers)
print(command.format(method=method, headers=headers, data=data, uri=uri))

