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
