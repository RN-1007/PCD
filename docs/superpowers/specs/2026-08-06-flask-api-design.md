# Design Specification: Kompresin Flask REST API Backend

## 1. Overview
Kompresin is an image compression and format conversion tool. The backend Flask service handles image packaging into ZIP archives, server-side WebP format conversion using Pillow, batch conversion history management, and health monitoring.

## 2. Architecture & Directory Structure
The project follows a modular Flask blueprint architecture to ensure clean separation of concerns, testability, and scalability.

```text
be-kompresin/
├── app.py                   # Application Factory (create_app) & Entry point
├── config.py                # App configuration (CORS, Max upload size)
├── requirements.txt         # Dependencies (Flask, Flask-CORS, Pillow, pytest)
├── routes/                  # Blueprint REST API Endpoints
│   ├── __init__.py
│   ├── convert.py           # POST /api/download-zip & POST /api/convert-and-zip
│   ├── batches.py           # GET/POST/DELETE /api/batches
│   └── health.py            # GET /api/health
├── services/                # Business Logic
│   ├── __init__.py
│   ├── image_service.py     # Pillow WebP conversion & in-memory zip packaging
│   └── batch_service.py     # Batch history storage and management
└── tests/                   # Test Suite (pytest)
    ├── __init__.py
    ├── test_convert.py      # Tests for packaging & image conversion endpoints
    ├── test_batches.py      # Tests for batch CRUD operations
    └── test_health.py       # Tests for healthcheck endpoint
```

## 3. Endpoints Specification

### 3.1 `POST /api/download-zip`
- **Content-Type**: `multipart/form-data`
- **Payload**: Form data with `files` (array of uploaded file streams).
- **Behavior**: Reads uploaded files directly from memory and packages them into a `.zip` archive without saving to disk.
- **Response**: `application/zip` with attachment header `filename=kompresin-batch-<timestamp>.zip`.
- **Error Handling**: `400 Bad Request` if no files are sent.

### 3.2 `POST /api/convert-and-zip`
- **Content-Type**: `multipart/form-data`
- **Payload**: Form data with `files` and optional `quality` (integer 1-100, default 80).
- **Behavior**: Reads images, handles mode conversions (RGBA/P -> RGB when saving JPGs), converts to WebP using Pillow, packages converted WebP files into `.zip` archive.
- **Response**: `application/zip` with attachment header `filename=kompresin-converted-<timestamp>.zip`.
- **Error Handling**: `400 Bad Request` if no files are sent or quality is invalid.

### 3.3 `GET /api/batches`
- **Response**: `application/json` array of historical batch conversion objects.

### 3.4 `POST /api/batches`
- **Content-Type**: `application/json`
- **Payload**: JSON object representing a completed conversion batch (e.g. `{ "id": "...", "filesCount": 5, "savedBytes": 1024, "createdAt": "..." }`).
- **Behavior**: Prepends the batch record to the in-memory batch storage.
- **Response**: `201 Created` with JSON `{ "success": true, "batch": <data> }`.

### 3.5 `DELETE /api/batches/<batch_id>`
- **Behavior**: Filters out and deletes the batch with matching `batch_id`.
- **Response**: `200 OK` with JSON `{ "success": true, "deleted_id": <batch_id> }`.

### 3.6 `GET /api/health`
- **Behavior**: Verifies Pillow WebP features support and returns server health status.
- **Response**: `200 OK` with JSON `{ "status": "healthy", "service": "Kompresin Flask API", "webp_support": true }`.

## 4. Dependencies
- `Flask>=3.0.0`
- `flask-cors>=4.0.0`
- `Pillow>=10.0.0`
- `pytest>=8.0.0` (development/testing)

## 5. Testing Strategy
- Use `pytest` and Flask test client (`app.test_client()`).
- Create sample images in memory using Pillow for test fixtures.
- Test edge cases: empty requests, invalid quality parameters, deleting non-existent batch IDs.
