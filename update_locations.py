## update_locations.py
# Python script to parse the location list on http://alchemistbeer.com/buy/
# The HTML content is parsed and the following is extracted for each location:
#   name: name of business location
#   address: address of business location
#   days: an array of the day(s) on which this location receives their delivery
#   cases_avail: true/false for if this location sells cases of Heady Topper
#   loc_type: type of business (store or eatery)
#   lat & lng: latitude and longitude coordinates calculated using the Google Maps API
# This script is built specifically to run on a Heroku application and connect to
#   a local Heroku Redis To Go instance. The extracted data is pickled and pushed to redis

from bs4 import BeautifulSoup
import json
import requests
import re
import os
import sys
import redis
import pickle

# Converts a string into proper titlecase. Unlike Python's built-in title(),
# this function correctly handles words with apostrophes such as "Boone's Bar"
def titlecase(s):
    return re.sub(r"[A-Za-z]+('[A-Za-z]+)?",
                  lambda mo: mo.group(0)[0].upper() +
                             mo.group(0)[1:].lower(),
                             s)

if __name__ == '__main__':

    try:
        redis_url = os.getenv('REDISTOGO_URL', 'redis://localhost:6379')
    except:
        print 'Unable to load redis environment variable'
        sys.exit(-1)

    redis = redis.from_url(redis_url)

    try:
        google_api_key = os.environ['GOOGLE_API_KEY']
    except KeyError:
        print 'Unable to load GOOGLE_API_KEY environment variable'
        sys.exit(-1)
    
    locations = []
    locations_url = 'http://alchemistbeer.com/buy/'
    response = requests.get(locations_url)
    soup = BeautifulSoup(response.content)

    maps_url = 'https://maps.googleapis.com/maps/api/geocode/json'
    
    count = 0
    for location in soup.find_all('div', 'location'):
        name = location.find('div', 'name').string.strip()
        try:
            name = name[:name.index('(')-1]
        except ValueError:
            pass
        name = titlecase(name)
        address = location.find('div', 'street').string.strip() + ', VT'
        delivery = location.find('div', 'delivery').contents
        days = delivery[0].split()
        for i, day in enumerate(days):
            days[i] = day.lower()
        if len(delivery) > 1:
            cases_avail = 'true'
        else:
            cases_avail = 'false'
        img_src = location.find('div', 'icon').img['src']
        if 'store' in img_src:
            loc_type = 'store'
        else:
            loc_type = 'eatery'

        params = {'key': google_api_key,
                  'sensor':'false',
                  'address': address}
        r = requests.get(maps_url, params=params)
        if r.json()['status'] == 'OK':
            lat = r.json()['results'][0]['geometry']['location']['lat']
            lng = r.json()['results'][0]['geometry']['location']['lng']
        else:
            lat = lng = ''
        
        locations.append({'name': name, 
                          'address': address,
                          'lat': lat,
                          'lng': lng,
                          'days': days,
                          'loc_type': loc_type,
                          'cases_avail': cases_avail})

        count += 1

    redis.set('locations', pickle.dumps(locations))
    print 'Updated locations successfully:', count, 'locations found'
