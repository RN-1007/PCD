from flask import Blueprint, request, jsonify
from services.batch_service import batch_service

batches_bp = Blueprint('batches', __name__)

@batches_bp.route('/api/batches', methods=['GET'])
def get_batches():
    """
    Mengambil daftar riwayat conversion batches
    ---
    tags:
      - Batches
    responses:
      200:
        description: List of batch history records
        schema:
          type: array
          items:
            type: object
    """
    return jsonify(batch_service.get_all())

@batches_bp.route('/api/batches', methods=['POST'])
def create_batch():
    """
    Menyimpan catatan batch konversi baru
    ---
    tags:
      - Batches
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            id:
              type: string
              example: batch-1723000000
            filesCount:
              type: integer
              example: 5
            totalSavedBytes:
              type: integer
              example: 102400
    responses:
      201:
        description: Batch record created successfully
    """
    data = request.json or {}
    added = batch_service.add_batch(data)
    return jsonify({"success": True, "batch": added}), 201

@batches_bp.route('/api/batches/<batch_id>', methods=['DELETE'])
def delete_batch(batch_id):
    """
    Menghapus record batch tertentu dari riwayat
    ---
    tags:
      - Batches
    parameters:
      - name: batch_id
        in: path
        type: string
        required: true
        description: ID batch yang akan dihapus
    responses:
      200:
        description: Batch record deleted successfully
    """
    deleted_id = batch_service.delete_batch(batch_id)
    return jsonify({"success": True, "deleted_id": deleted_id})
