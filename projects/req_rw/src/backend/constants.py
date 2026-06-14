import os

APP_NAME = 'Req.rw'
PORT = 9876

_HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(_HERE))
STATIC_DIR = os.path.join(PROJECT_ROOT, 'build', 'parcel', 'dev')
