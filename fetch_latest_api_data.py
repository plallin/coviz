#!/usr/bin/env python3

import requests
import re
from bs4 import BeautifulSoup, NavigableString, Tag
import json

def query(field):
  return {
    'f': 'json',
    'where': f"{field}>0",
    'returnGeometry': False,
    'spatialRel': 'esriSpatialRelIntersects',
    'outFields': f'*',
    'orderByFields': f'{field} asc',
    'resultOffset': 0,
    'resultRecordCount': 32000,
    'resultType': 'standard'
  }

SOURCE = 'https://services-eu1.arcgis.com'
API = '/z6bHNio59iTqqSUY/arcgis/rest/services/'

resp = requests.get(SOURCE + API)

soup = BeautifulSoup(resp.content, 'html.parser')

apis = []
for link in soup.find_all('a'):
    if link.get('href').startswith('/z6bHNio59iTqqSUY/ArcGIS/rest/services/'):
      api_link = link.get('href') + '/0'
      # print(api_link)
      apis.append(api_link)
      resp = requests.get(SOURCE + api_link)
      soup2 = BeautifulSoup(resp.content, 'html.parser')
      # print(soup2.prettify())
      for li in soup2.find_all('li'):
        if 'esriFieldTypeOID' in li.text.strip():
          field = li.find('i').previous_sibling
          url = SOURCE + api_link + '/query'
          res = requests.get(url, params= query(field))
          # print(res.text)
          name = link.get('href').split('/')[5]
          with open(f"datahub-scrap/{name}.json", 'w', encoding='utf-8') as f:
            json.dump(json.loads(res.text), f, ensure_ascii=False, indent=4)
          print(f"scrapped API {name}")
