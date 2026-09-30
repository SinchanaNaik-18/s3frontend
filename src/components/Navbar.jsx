import React from 'react';
import { Cloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Navbar({ backendStatus, onRefreshStatus, checkingStatus }) {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand">
          <div className="brand-icon">
            <Cloud size={24} />
          </div>
          <div>
            <h1 className="brand-title">EventSphere</h1>
            <p className="brand-subtitle">AWS S3 File Storage Microservice</p>
          </div>
        </div>

        <div className="nav-badges">
          <div className={`badge ${backendStatus.connected ? 'badge-connected' : 'badge-disconnected'}`}>
            <span className="badge-dot"></span>
            {backendStatus.connected ? (
              <span>Backend Online (Port 8087)</span>
            ) : (
              <span>Backend Offline</span>
            )}
          </div>
          <button
            onClick={onRefreshStatus}
            disabled={checkingStatus}
            title="Refresh backend status"
            className="btn-action-small"
          >
            <RefreshCw size={14} className={checkingStatus ? 'animate-spin' : ''} />
            <span>Check</span>
          </button>
        </div>
      </div>
    </header>
  );
}
