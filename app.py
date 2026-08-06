from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from config import Config
from routes.health import health_bp
from routes.batches import batches_bp
from routes.convert import convert_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "Kompresin REST API Documentation",
            "description": "Dokumentasi OpenAPI / Swagger REST API untuk Kompresin Backend Service",
            "version": "1.0.0"
        }
    }

    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/"
    }

    Swagger(app, template=swagger_template, config=swagger_config)

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(batches_bp)
    app.register_blueprint(convert_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
