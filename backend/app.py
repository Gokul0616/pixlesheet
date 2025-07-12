from flask import Flask, request, jsonify
from flask_cors import CORS
from models import SpreadsheetModel
from routes import register_routes
import os

app = Flask(__name__)
CORS(app)

# Initialize the model
model = SpreadsheetModel()

# Register routes
register_routes(app, model)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
