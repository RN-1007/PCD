# Kompresin Flask REST API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a modular Python Flask REST API for Kompresin supporting image packaging to ZIP, server-side WebP conversion, batch history management, and health checking with 100% pytest endpoint coverage.

**Architecture:** Modular Flask Blueprint architecture with separate route blueprints (`health`, `batches`, `convert`), service layer for Pillow image processing & ZIP building, in-memory batch state management, and CORS support.

**Tech Stack:** Python 3.10+, Flask 3.x, Flask-CORS, Pillow 10.x, pytest.

---

### Task 1: Setup Dependencies and Configuration

**Files:**
- Create: `requirements.txt`
- Create: `config.py`

- [ ] **Step 1: Write requirements.txt**

```text
Flask>=3.0.0
flask-cors>=4.0.0
Pillow>=10.0.0
pytest>=8.0.0
```

- [ ] **Step 2: Install dependencies into python environment**

Run: `.venv\Scripts\python.exe -m pip install -r requirements.txt`
Expected: Successfully installed Flask, flask-cors, Pillow, pytest.

- [ ] **Step 3: Create config.py**

```python
import os

class Config:
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB max upload limit
    CORS_HEADERS = 'Content-Type'
```

---

### Task 2: Healthcheck Route & Application Factory

**Files:**
- Create: `routes/__init__.py`
- Create: `routes/health.py`
- Create: `app.py`
- Create: `tests/__init__.py`
- Create: `tests/test_health.py`

- [ ] **Step 1: Write failing test for healthcheck**

```python
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'healthy'
    assert json_data['service'] == 'Kompresin Flask API'
    assert 'webp_support' in json_data
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv\Scripts\pytest.exe tests/test_health.py`
Expected: FAIL (ModuleNotFoundError: No module named 'app')

- [ ] **Step 3: Implement health route and app factory**

Create `routes/__init__.py`:
```python
# Routes package
```

Create `routes/health.py`:
```python
from flask import Blueprint, jsonify
from PIL import features

health_bp = Blueprint('health', __name__)

@health_bp.route('/api/health', methods=['GET'])
def health_check():
    webp_supported = features.check('webp')
    return jsonify({
        "status": "healthy",
        "service": "Kompresin Flask API",
        "webp_support": webp_supported
    })
```

Create `app.py`:
```python
from flask import Flask
from flask_cors import CORS
from config import Config
from routes.health import health_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    # Register blueprints
    app.register_blueprint(health_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv\Scripts\pytest.exe tests/test_health.py`
Expected: PASS

---

### Task 3: Batch Service & Endpoints (GET, POST, DELETE /api/batches)

**Files:**
- Create: `services/__init__.py`
- Create: `services/batch_service.py`
- Create: `routes/batches.py`
- Modify: `app.py`
- Create: `tests/test_batches.py`

- [ ] **Step 1: Write failing tests for batch operations**

Create `tests/test_batches.py`:
```python
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_batch_lifecycle(client):
    # 1. Get empty batches
    res_get1 = client.get('/api/batches')
    assert res_get1.status_code == 200
    assert res_get1.get_json() == []

    # 2. Post new batch
    new_batch = {"id": "batch-101", "filesCount": 3, "totalSaved": 500}
    res_post = client.post('/api/batches', json=new_batch)
    assert res_post.status_code == 201
    assert res_post.get_json()['success'] is True
    assert res_post.get_json()['batch']['id'] == "batch-101"

    # 3. Get batches after insert
    res_get2 = client.get('/api/batches')
    assert res_get2.status_code == 200
    batches = res_get2.get_json()
    assert len(batches) == 1
    assert batches[0]['id'] == "batch-101"

    # 4. Delete batch
    res_del = client.delete('/api/batches/batch-101')
    assert res_del.status_code == 200
    assert res_del.get_json()['deleted_id'] == "batch-101"

    # 5. Get batches after delete
    res_get3 = client.get('/api/batches')
    assert res_get3.get_json() == []
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv\Scripts\pytest.exe tests/test_batches.py`
Expected: FAIL 404 (Route /api/batches not found)

- [ ] **Step 3: Implement batch_service and routes/batches.py**

Create `services/__init__.py`:
```python
# Services package
```

Create `services/batch_service.py`:
```python
class BatchService:
    def __init__(self):
        self._batches = []

    def get_all(self):
        return list(self._batches)

    def add_batch(self, batch_data):
        self._batches.insert(0, batch_data)
        return batch_data

    def delete_batch(self, batch_id):
        self._batches = [b for b in self._batches if b.get('id') != batch_id]
        return batch_id

batch_service = BatchService()
```

Create `routes/batches.py`:
```python
from flask import Blueprint, request, jsonify
from services.batch_service import batch_service

batches_bp = Blueprint('batches', __name__)

@batches_bp.route('/api/batches', methods=['GET'])
def get_batches():
    return jsonify(batch_service.get_all())

@batches_bp.route('/api/batches', methods=['POST'])
def create_batch():
    data = request.json or {}
    added = batch_service.add_batch(data)
    return jsonify({"success": True, "batch": added}), 201

@batches_bp.route('/api/batches/<batch_id>', methods=['DELETE'])
def delete_batch(batch_id):
    deleted_id = batch_service.delete_batch(batch_id)
    return jsonify({"success": True, "deleted_id": deleted_id})
```

Register blueprint in `app.py`:
```python
from flask import Flask
from flask_cors import CORS
from config import Config
from routes.health import health_bp
from routes.batches import batches_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    app.register_blueprint(health_bp)
    app.register_blueprint(batches_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv\Scripts\pytest.exe tests/test_batches.py`
Expected: PASS

---

### Task 4: Image & ZIP Processing Service & Conversion Routes

**Files:**
- Create: `services/image_service.py`
- Create: `routes/convert.py`
- Modify: `app.py`
- Create: `tests/test_convert.py`

- [ ] **Step 1: Write failing tests for conversion & ZIP packaging**

Create `tests/test_convert.py`:
```python
import io
import zipfile
import pytest
from PIL import Image
from app import create_app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def create_dummy_image_bytes(fmt='PNG', color='red'):
    img = Image.new('RGB', (100, 100), color=color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    buf.seek(0)
    return buf

def test_download_zip_no_files(client):
    res = client.post('/api/download-zip')
    assert res.status_code == 400
    assert res.get_json()['error'] == "No files provided"

def test_download_zip_success(client):
    img_buf = create_dummy_image_bytes()
    data = {
        'files': (img_buf, 'test.webp')
    }
    res = client.post('/api/download-zip', data=data, content_type='multipart/form-data')
    assert res.status_code == 200
    assert res.mimetype == 'application/zip'

    # Verify contents of returned ZIP
    zip_bytes = io.BytesIO(res.data)
    with zipfile.ZipFile(zip_bytes, 'r') as zf:
        file_list = zf.namelist()
        assert 'test.webp' in file_list

def test_convert_and_zip_success(client):
    img_buf = create_dummy_image_bytes(fmt='PNG')
    data = {
        'files': (img_buf, 'test_image.png'),
        'quality': '85'
    }
    res = client.post('/api/convert-and-zip', data=data, content_type='multipart/form-data')
    assert res.status_code == 200
    assert res.mimetype == 'application/zip'

    # Verify converted image in ZIP
    zip_bytes = io.BytesIO(res.data)
    with zipfile.ZipFile(zip_bytes, 'r') as zf:
        file_list = zf.namelist()
        assert 'test_image.webp' in file_list
        converted_bytes = zf.read('test_image.webp')
        converted_img = Image.open(io.BytesIO(converted_bytes))
        assert converted_img.format == 'WEBP'
```

- [ ] **Step 2: Run test to verify it fails**

Run: `.venv\Scripts\pytest.exe tests/test_convert.py`
Expected: FAIL 404 (Routes not registered)

- [ ] **Step 3: Implement image_service and routes/convert.py**

Create `services/image_service.py`:
```python
import io
import time
import zipfile
from PIL import Image

def build_zip_from_files(uploaded_files):
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_obj in uploaded_files:
            file_bytes = file_obj.read()
            filename = file_obj.filename or "image.webp"
            zip_file.writestr(filename, file_bytes)
    zip_buffer.seek(0)
    return zip_buffer

def convert_images_to_webp_zip(uploaded_files, quality=80):
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_obj in uploaded_files:
            try:
                image = Image.open(file_obj.stream)
                
                # Handle mode conversions
                if image.mode in ("RGBA", "P") and (file_obj.filename or '').lower().endswith(('.jpg', '.jpeg')):
                    image = image.convert("RGB")

                webp_buffer = io.BytesIO()
                image.save(webp_buffer, format="WEBP", quality=quality)
                webp_buffer.seek(0)

                filename = file_obj.filename or "image.png"
                base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
                webp_filename = f"{base_name}.webp"

                zip_file.writestr(webp_filename, webp_buffer.getvalue())
            except Exception as e:
                print(f"Error processing {file_obj.filename}: {e}")
    
    zip_buffer.seek(0)
    return zip_buffer
```

Create `routes/convert.py`:
```python
import time
from flask import Blueprint, request, jsonify, send_file
from services.image_service import build_zip_from_files, convert_images_to_webp_zip

convert_bp = Blueprint('convert', __name__)

@convert_bp.route('/api/download-zip', methods=['POST'])
def download_zip():
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
```

Register blueprint in `app.py`:
```python
from flask import Flask
from flask_cors import CORS
from config import Config
from routes.health import health_bp
from routes.batches import batches_bp
from routes.convert import convert_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)

    app.register_blueprint(health_bp)
    app.register_blueprint(batches_bp)
    app.register_blueprint(convert_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `.venv\Scripts\pytest.exe tests/test_convert.py`
Expected: PASS

---

### Task 5: Run Full Test Suite & Sanity Verification

- [ ] **Step 1: Run pytest across all tests**

Run: `.venv\Scripts\pytest.exe -v`
Expected: All tests pass (test_health, test_batches, test_convert).
