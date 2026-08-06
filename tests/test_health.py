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

def test_swagger_docs(client):
    response = client.get('/apidocs/')
    assert response.status_code == 200
    assert b'Kompresin REST API Documentation' in response.data or b'swagger' in response.data.lower()
