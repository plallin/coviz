# coviz

An attempt an visualiasing the rollout of the covid-19 vaccines in Ireland by someone who is absolutely not a front-end developer.

## Visualisation

Visualisation is available at https://plallin.github.io/coviz/

## Vaccination rollout data

Data from December 29 2020 to February 4th 2021 are estimates based on press release.

From February 5th, 2021, Source is: covid-19.geohive.ie/pages/vaccinations

From 12th of May to June 29th 2021, data is estimated due to the HSE Ramsomware attack.

From October 5th 2021, vaccine visualisation has been discontinued. The schema from the upstream API has been modified; their daily vaccination API no longer shows the breakdown by vaccine type and I don't wish to get ride of that.

## Booster rollout

tbd

## Data scrap

Data is being scrapped from the [upstream API](https://services-eu1.arcgis.com/z6bHNio59iTqqSUY/arcgis/rest/services/) hourly. A dump of the data is available in [datahub-scrap](datahub-scrap).