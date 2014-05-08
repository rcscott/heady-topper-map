## heady-topper-map.py Flask application
# Default route: serves the Heady Topper Map web app
# /api/locations: returns a JSON object from local Heroku Redis instance

import os
from flask import Flask, jsonify, render_template
import redis
import pickle

app = Flask(__name__)

redis_url = os.getenv('REDISTOGO_URL', 'redis://localhost:6379')
redis = redis.from_url(redis_url)

@app.route('/api/locations', methods = ['GET'])
def get_locations():
    locations = pickle.loads(redis.get('locations'))
    return jsonify({'locations': locations})

@app.route('/')
def index():
    return render_template('index.html')

