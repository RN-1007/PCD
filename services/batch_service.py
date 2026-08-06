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
