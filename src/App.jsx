import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ConverterCard from './components/ConverterCard';
import RecentBatches from './components/RecentBatches';
import Footer from './components/Footer';
import { fetchBatches, deleteBatchRecord } from './services/api';

export default function App() {
  const [batches, setBatches] = useState([]);

  // Fetch batches from Flask backend on mount (GET /api/batches)
  useEffect(() => {
    async function loadBatches() {
      const data = await fetchBatches();
      if (Array.isArray(data)) {
        setBatches(data);
      }
    }
    loadBatches();
  }, []);

  const handleBatchCompleted = (newBatch) => {
    setBatches((prev) => [newBatch, ...prev]);
  };

  const handleDeleteBatch = async (batchId) => {
    // Optimistic UI update
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
    // Sync deletion with Flask backend (DELETE /api/batches/{batch_id})
    await deleteBatchRecord(batchId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-gutter py-xl">
        <Hero />
        <ConverterCard onBatchCompleted={handleBatchCompleted} />
        <RecentBatches batches={batches} onDeleteBatch={handleDeleteBatch} />
      </main>
      <Footer />
    </div>
  );
}
