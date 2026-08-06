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
