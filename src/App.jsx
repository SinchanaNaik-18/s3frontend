import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UploadSection from './components/UploadSection';
import DownloadSection from './components/DownloadSection';
import { checkBackendHealth } from './services/api';
import { Database, ShieldCheck, HardDrive, ArrowRight } from 'lucide-react';
import './App.css';

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ connected: false, message: 'Checking...' });
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [prefilledDownloadId, setPrefilledDownloadId] = useState('');

  const verifyBackend = async () => {
    setCheckingStatus(true);
    try {
      const data = await checkBackendHealth();
      setBackendStatus({ connected: true, message: data.status || 'Connected' });
    } catch (err) {
      setBackendStatus({ connected: false, message: err.message });
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    verifyBackend();
  }, []);

  const handleUploadSuccess = (imageId) => {
    setPrefilledDownloadId(imageId);
  };

  return (
    <div className="app-container">
      <Navbar
        backendStatus={backendStatus}
        onRefreshStatus={verifyBackend}
        checkingStatus={checkingStatus}
      />

      <main className="main-content">
        {/* Architecture & S3 Prefix Guarantee Banner */}
        <section className="arch-banner">
          <div className="arch-info">
            <h2>
              <ShieldCheck size={20} color="#a5b4fc" />
              EventSphere S3 Architecture
            </h2>
            <p>
              React communicates <strong>only</strong> with the Spring Boot backend. All uploaded objects are strictly stored inside the <code className="font-mono" style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>eventsphere/</code> prefix in bucket <code className="font-mono" style={{ color: '#fff' }}>s3-test-01-navaneeth</code>.
            </p>
          </div>

          <div className="flow-pills">
            <span>React (Port 3000)</span>
            <ArrowRight size={14} className="flow-arrow" />
            <span>Spring Boot REST (Port 8087)</span>
            <ArrowRight size={14} className="flow-arrow" />
            <span>AWS S3 (eventsphere/&#123;id&#125;)</span>
          </div>
        </section>

        {/* 2-Column Responsive Hub */}
        <div className="app-grid">
          {/* Upload Column (Requirements 1, 2, 3) */}
          <UploadSection onUploadSuccess={handleUploadSuccess} />

          {/* Download Column (Requirements 4, 5, 6, 7) */}
          <DownloadSection prefilledId={prefilledDownloadId} />
        </div>
      </main>

      <footer className="footer">
        <p>
          EventSphere Full-Stack Application • Spring Boot REST Microservice + React + AWS SDK S3
        </p>
      </footer>
    </div>
  );
}
