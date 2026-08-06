import time
from flask import Blueprint, request, jsonify, send_file
from services.image_service import build_zip_from_files, convert_images_to_webp_zip

convert_bp = Blueprint('convert', __name__)

@convert_bp.route('/api/download-zip', methods=['POST'])
def download_zip():
    """
    Menerima file gambar dan mengemasnya menjadi ZIP in-memory
    ---
    tags:
      - Conversion & Download
    consumes:
      - multipart/form-data
    parameters:
      - name: files
        in: formData
        type: file
        required: true
        description: File gambar terkonversi
    responses:
      200:
        description: File ZIP yang dikemas
      400:
        description: No files provided
    """
    if 'files' not in request.files:
        return jsonify({"error": "No files provided"}), 400

    uploaded_files = request.files.getlist('files')
    if not uploaded_files or uploaded_files[0].filename == '':
        return jsonify({"error": "No files provided"}), 400

    zip_buffer = build_zip_from_files(uploaded_files)
    filename_out = f"kompresin-batch-{int(time.time())}.zip"

    return send_file(
        zip_buffer,
        mimetype='application/zip',
        as_attachment=True,
        download_name=filename_out
    )

@convert_bp.route('/api/convert-and-zip', methods=['POST'])
def convert_and_zip():
    """
    Menerima file gambar asli, mengonversi ke WebP di server, dan merespon ZIP
    ---
    tags:
      - Conversion & Download
    consumes:
      - multipart/form-data
    parameters:
      - name: files
        in: formData
        type: file
        required: true
        description: File gambar asli (JPG/PNG)
      - name: quality
        in: formData
        type: integer
        default: 80
        description: Kualitas WebP (1-100)
    responses:
      200:
        description: File ZIP terkonversi
      400:
        description: No files uploaded
    """
    if 'files' not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    uploaded_files = request.files.getlist('files')
    if not uploaded_files or uploaded_files[0].filename == '':
        return jsonify({"error": "No files uploaded"}), 400

    try:
        quality = int(request.form.get('quality', 80))
        quality = max(1, min(100, quality))
    except (ValueError, TypeError):
        quality = 80

    zip_buffer = convert_images_to_webp_zip(uploaded_files, quality=quality)
    filename_out = f"kompresin-converted-{int(time.time())}.zip"

    return send_file(
        zip_buffer,
        mimetype='application/zip',
        as_attachment=True,
        download_name=filename_out
    )
