#!/usr/bin/env python3

from typing import List, Dict
from collections import namedtuple
from datetime import datetime, timedelta
import csv
import json
import urllib.request

VACCINE_DATA_FILE = 'data-sources/vaccines.csv'
COMMENT_FILE = 'data-sources/comments.csv'
API = 'https://covid19.shanehastings.eu/vaccines/json/historical/'

VaccineData = namedtuple('VaccineData', 'date,total,daily,rolling_day_avg,first_dose,second_dose,pfizer_biontech,moderna,astrazeneca')
ApiData = namedtuple('ApiData', 'id date first_dose second_dose total_vaccinations pfizer_biontech moderna astrazeneca')
Comment = namedtuple('Comment', 'date,comment')
MasterSheet = namedtuple('MasterSheet', 'date,total,daily,rolling_day_avg,first_dose,second_dose,pfizer_biontech,moderna,astrazeneca,comment')

def get_and_sort_api_data() -> List[Dict]:
    response = urllib.request.urlopen(API)
    api_data = json.loads(response.read())['GeoHive_Historical_Data']
    api_data.sort(key=lambda val: date(val['date'], '%Y-%m-%d'))
    return api_data

def check_new_data(last_update: str) -> List[ApiData]:
    api_data = get_and_sort_api_data()
    new_data = []
    for api_datum in reversed(api_data):
        if date(last_update) < date(api_datum['date'], '%Y-%m-%d'):
            api_datum['date'] = stringify_date(date(api_datum['date'], '%Y-%m-%d'))
            new_data.insert(0, (ApiData(**api_datum)))
        else:
            return new_data
    return new_data

def compute_new_average(last_updates: List[VaccineData], new_daily_figure: int) -> int:
    total_rolling_7_days = int(new_daily_figure) + sum([int(x.daily) for x in last_updates])
    return round(total_rolling_7_days / 7)

def create_master_sheet_data() -> List[MasterSheet]:
    fvax = open(VACCINE_DATA_FILE, 'r')
    rows_vax = fvax.readlines()
    vaccine_data = parse_vaccine_data(rows_vax)

    fcomment = open(COMMENT_FILE, 'r')
    rows_comment = fcomment.readlines()
    comment_data = parse_comment_data(rows_comment)

    vaccine_index = 1 # skip headers
    comment_index = 1 # skip headers
    master_sheet = []
    current_date = date('2020-dec-29')
    while vaccine_index < len(vaccine_data):
        current_date = date(vaccine_data[vaccine_index].date)
        if comment_index < len(comment_data) and current_date == date(comment_data[comment_index].date):
            master_sheet.append(MasterSheet(*vaccine_data[vaccine_index], comment_data[comment_index].comment))
            vaccine_index += 1
            comment_index += 1
        else:
            master_sheet.append(MasterSheet(*vaccine_data[vaccine_index], ''))
            vaccine_index += 1
    while comment_index < len(comment_data):
        current_date += timedelta(days=1)
        if current_date == date(comment_data[comment_index].date):
            master_sheet.append(MasterSheet(stringify_date(current_date),0,0,0,0,0,0,0,0,comment_data[comment_index].comment))
            comment_index += 1
        else:
            master_sheet.append(MasterSheet(stringify_date(current_date),0,0,0,0,0,0,0,0,''))
    return master_sheet

def create_new_rows(api_data: List[ApiData]):
    for api_datum in api_data:
        last_rows = get_last_rows(VACCINE_DATA_FILE, 6)
        last_rows_data = parse_vaccine_data(last_rows)
        new_daily_figure = int(api_datum.total_vaccinations) - int(last_rows_data[-1].total)
        new_rolling_avg = compute_new_average(last_rows_data, new_daily_figure)
        new_vax_data = VaccineData(api_datum.date, api_datum.total_vaccinations, new_daily_figure, new_rolling_avg, api_datum.first_dose,
                                    api_datum.second_dose,api_datum.pfizer_biontech,api_datum.moderna,api_datum.astrazeneca)
        formatted_data = ','.join(str(e) for e in list(new_vax_data))
        f = open(VACCINE_DATA_FILE, 'a')
        f.write(f'\n{formatted_data}')
        f.close()

def get_last_rows(file_name: str, number_of_lines: int) -> List[str]:
    f = open(file_name, 'r')
    rows = f.readlines()
    last_rows = rows[-1 * number_of_lines:]
    f.close()
    return last_rows

def last_update_date() -> str:
    last_line = get_last_rows(VACCINE_DATA_FILE, 1)
    last_vax_data = parse_vaccine_data(last_line)
    return last_vax_data[0].date

def parse_comment_data(rows: List[str]) -> List[Comment]:
    data = []
    for row in rows:
        datum = Comment(*row.split(',', 1))
        data.append(datum)
    return data

def parse_vaccine_data(rows: List[str]) -> List[VaccineData]:
    data = []
    for row in rows:
        datum = VaccineData(*row.split(','))
        data.append(datum)
    return data

def render_master_sheet(data: List[MasterSheet]):
    with open('data.csv', 'w') as f:
        my_csv = csv.writer(f, delimiter=',')
        my_csv.writerow(list(MasterSheet._fields))
        for datum in data:
            my_csv.writerow([str(x).strip() for x in list(datum)])


def date(s: str, date_format: str = '%Y-%b-%d') -> datetime:
    return datetime.strptime(s, date_format)

def stringify_date(d: datetime, date_format:str = '%Y-%b-%d') -> str:
    return d.strftime(date_format)

if __name__ == "__main__":
    last_update = last_update_date()
    new_data = check_new_data(last_update)
    if new_data:
        print('new data found')
        create_new_rows(new_data)
        print('vaccines csv sheet updates')
        data = create_master_sheet_data()
        print('preparing to update mastersheet')
        render_master_sheet(data)
        print('mastersheet updated')

