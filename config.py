import os

class Config:
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB max upload limit
    CORS_HEADERS = 'Content-Type'
