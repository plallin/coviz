#!/usr/bin/env python3

import urllib.request, json, csv, time
from collections import namedtuple
from collections import deque

# initial script to scrap data from the API
# not proud of this!

DailyUpdate = namedtuple('DailyUpdate', 
                         'date total first_dose second_dose pfizer_biontech moderna astrazeneca')

CsvRow = namedtuple('CsvRow', 'date total daily rolling_day_avg first_dose second_dose pfizer_biontech moderna astrazeneca comment')

def check_new_data(upstream_data, last_update):
  new_data = []
  for i in range(len(upstream_data) - 1, 0, -1):
    if last_update <= time.strptime(upstream_data[i]['date'], '%Y-%m-%d'):
      new_data.insert(0, DailyUpdate(
        date = time.strftime('%Y-%b-%d' ,time.strptime(upstream_data[i]['date'], '%Y-%m-%d')),
        total = upstream_data[i]['total_vaccinations'],
        first_dose = upstream_data[i]['first_dose'],
        second_dose = upstream_data[i]['second_dose'],
        pfizer_biontech = upstream_data[i]['pfizer_biontech'],
        moderna = upstream_data[i]['moderna'],
        astrazeneca = upstream_data[i]['astrazeneca'])
      )
  return new_data

def compute_daily(past_data, new_total):
  previous_total = list(past_data)[0].total
  return int(new_total) - int(previous_total)

def compute_average(past_data, new_daily):
  past_daily = [int(x.daily) for x in list(past_data)]
  return round((sum(past_daily) + new_daily) / 7)

def last_update(date):
  f = open(".last-update", "w")
  f.write(time.strftime('%d-%b-%Y', date))
  f.close()

def make_csv_row(date, total, daily, rolling_day_avg, first_dose, second_dose, pfizer_biontech, moderna, astrazeneca, comment):
  return CsvRow(
        date=date,
        total=total,
        daily=daily,
        rolling_day_avg=rolling_day_avg,
        first_dose=first_dose,
        second_dose=second_dose,
        pfizer_biontech=pfizer_biontech,
        moderna=moderna,
        astrazeneca=astrazeneca,
        comment=comment
  )

def update_local_data(new_data):
  local_data = csv.reader(open('data.csv'), delimiter=',')
  my_csv = list(local_data)
  last_6_entries = deque(6 * [0], 6)
  current_index = 0
  for i in range(0, len(my_csv)):
    date, total, daily, rolling_day_avg, first_dose, second_dose, pfizer_biontech, moderna, astrazeneca, comment = my_csv[i]
    if date == 'date':
      pass
    else:
      current_csv_row = make_csv_row(date, total, daily, rolling_day_avg, first_dose, second_dose, pfizer_biontech, moderna, astrazeneca, comment)

      print(new_data[current_index].date)
      print(current_csv_row.date)
      if new_data[current_index].date == current_csv_row.date:
        new_daily = compute_daily(last_6_entries, new_data[current_index].total)
        rolling_day_avg = compute_average(last_6_entries, new_daily)
        current_update = new_data[current_index]
        new_row_csv = make_csv_row(current_update.date, current_update.total, new_daily, rolling_day_avg, current_update.first_dose,
                                  current_update.second_dose, current_update.pfizer_biontech, current_update.moderna, current_update.astrazeneca,
                                  current_csv_row.comment)

        my_csv[i] = [
          current_update.date,
          new_row_csv.total,
          new_row_csv.daily,
          new_row_csv.rolling_day_avg,
          new_row_csv.first_dose,
          new_row_csv.second_dose,
          new_row_csv.pfizer_biontech,
          new_row_csv.moderna,
          new_row_csv.astrazeneca,
          new_row_csv.comment
        ]
        current_csv_row = new_row_csv
        current_index += 1
        if current_index >= len(new_data):
          break


      last_6_entries.appendleft(current_csv_row)

  with open('new-data.csv', 'w') as f:
    w = csv.writer(f)
    w.writerows(my_csv)
    
        

if __name__ == "__main__":
  # read upstream data
  data_source = 'https://covid19.shanehastings.eu/vaccines/json/historical/'
  response = urllib.request.urlopen(data_source)
  upstream_data = json.loads(response.read())['GeoHive_Historical_Data']
  upstream_data.sort(key=lambda val: time.strptime(val['date'], '%Y-%m-%d'))

  # check last update
  last_update = open(".last-update", "r").read()
  last_update = time.strptime(last_update, '%d-%b-%Y')
  # check if there is new data
  new_data = check_new_data(upstream_data, last_update)

  # insert new daya
  if new_data:
    update_local_data(new_data)