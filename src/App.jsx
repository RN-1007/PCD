import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ConverterCard from './components/ConverterCard';
import RecentBatches from './components/RecentBatches';
import Footer from './components/Footer';

export default function App() {
  const [batches, setBatches] = useState([
    {
      id: 'batch-demo-1',
      name: 'Batch #042 - Today, 2:45 PM',
      fileCount: 12,
      savedSize: '4.2 MB'
    },
    {
      id: 'batch-demo-2',
      name: 'Batch #041 - Yesterday, 11:20 AM',
      fileCount: 5,
      savedSize: '1.8 MB'
    }
  ]);

  const handleBatchCompleted = (newBatch) => {
    setBatches((prev) => [newBatch, ...prev]);
  };

  const handleDeleteBatch = (batchId) => {
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
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
