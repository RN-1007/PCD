from flask import Blueprint, jsonify
from PIL import features

health_bp = Blueprint('health', __name__)

@health_bp.route('/api/health', methods=['GET'])
def health_check():
    """
    Healthcheck status server & WebP support check
    ---
    tags:
      - Health
    responses:
      200:
        description: Status server & Pillow WebP engine capability
        schema:
          type: object
          properties:
            status:
              type: string
              example: healthy
            service:
              type: string
              example: Kompresin Flask API
            webp_support:
              type: boolean
              example: true
    """
    webp_supported = features.check('webp')
    return jsonify({
        "status": "healthy",
        "service": "Kompresin Flask API",
        "webp_support": webp_supported
    })
