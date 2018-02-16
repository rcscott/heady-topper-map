Heady Topper Map
================

**Note: This project is no longer functional because it hasn't been updated to work with The Alchemist's new website.**

Heady Topper beer release information from The Alchemist's website, overlayed on Google Maps.

Information is pulled nightly from http://alchemistbeer.com/buy/

Project demo at ~~http://heady-topper-map.herokuapp.com/~~

================

This project runs on Heroku.

`heady-topper-map.py` is a Flask application that serves the client web page. It also returns a JSON object of the locations data from ~~http://heady-topper-map.herokuapp.com/api/locations~~

`update_locations.py` runs nightly to update the location data from The Alchemist's website. Data is stored in a Heroku Redis instance.
