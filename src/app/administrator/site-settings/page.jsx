'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { showToast } from '../../../utils/toast';
import BulkUploadModal from '../../../components/BulkUploadModal';
import { useDarkMode } from '../../../hooks/useDarkMode';

const COUNTDOWN_SECONDS = 15;

export default function AdminSiteSettings() {
  const dark = useDarkMode();
  const [phase, setPhase] = useState('idle');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [deleting, setDeleting] = useState(false);
  const [dashboardPeriod, setDashboardPeriod] = useState('90');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('dashboardPeriod');
    if (saved) setDashboardPeriod(saved);
  }, []);

  const handlePeriodChange = (e) => {
    const val = e.target.value;
    setDashboardPeriod(val);
    localStorage.setItem('dashboardPeriod', val);
    showToast('Dashboard period updated.');
  };

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleFirstClick = () => {
    setPhase('countdown');
    setCountdown(COUNTDOWN_SECONDS);
    clearTimer();
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setPhase('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancel = () => {
    clearTimer();
    setPhase('idle');
    setCountdown(COUNTDOWN_SECONDS);
  };

  const handleConfirmDelete = () => {
    if (typeof window.TicketAPI === 'undefined') {
      showToast('API is not available.', 'error');
      return;
    }
    setDeleting(true);

    const api = window.TicketAPI;
    const deleteAll = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '')}/api/Admin/end-term`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete tickets. Ensure you have the correct permissions.');
        }

        const data = await response.json();
        const count = data.deletedCount || 0;
        showToast(`Successfully deleted ${count} ticket(s). All data cleared.`);
      } catch (err) {
        showToast((err && err.message) ? err.message : 'Failed to delete tickets.', 'error');
      }
      setPhase('idle');
      setDeleting(false);
      setCountdown(COUNTDOWN_SECONDS);
    };

    deleteAll();
  };

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const isSuperAdmin = userRole === 'SuperAdmin';

  return (
    <>
      <h1 className="page-title">Site Settings</h1>

      {/* Dashboard General Settings */}
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: dark ? '#e2e8f0' : '#343a40', marginBottom: 4 }}>
            <i className="fas fa-tachometer-alt" style={{ color: '#6f42c1', marginRight: 8 }}></i>
            Dashboard Performance Filter
          </div>
          <p style={{ margin: 0, color: dark ? '#94a3b8' : '#6c757d', fontSize: '0.9rem' }}>
            Control the time frame for data fetched on the dashboard. Selecting a shorter period greatly improves performance by excluding old tickets from the statistics.
          </p>
        </div>

        <div className="form-group" style={{ maxWidth: 300 }}>
          <label htmlFor="dashboardPeriod" className="form-label">Analytics Time Frame</label>
          <select
            id="dashboardPeriod"
            className="form-control"
            value={dashboardPeriod}
            onChange={handlePeriodChange}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 1 Month</option>
            <option value="90">Last 3 Months</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Last 1 Year</option>
            <option value="all">All Time (Slowest)</option>
          </select>
        </div>
      </div>

      {/* Overlay Loader */}
      {deleting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: dark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#dc3545', marginBottom: 16 }}></i>
          <h2 style={{ color: '#dc3545', margin: 0 }}>Deleting everything...</h2>
          <p style={{ color: dark ? '#94a3b8' : '#666', marginTop: 8 }}>Please do not close this window.</p>
        </div>
      )}

      {/* Bulk Upload Settings */}
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: dark ? '#e2e8f0' : '#343a40', marginBottom: 4 }}>
            <i className="fas fa-file-excel" style={{ color: '#28a745', marginRight: 8 }}></i>
            Students Bulk Management
          </div>
          <p style={{ margin: 0, color: dark ? '#94a3b8' : '#6c757d', fontSize: '0.9rem' }}>
            Upload an Excel file to quickly insert new students or update existing ones in the system.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsUploadOpen(true)}
          style={{ background: '#28a745', borderColor: '#28a745' }}
        >
          <i className="fas fa-upload" style={{ marginRight: 8 }}></i> Open Bulk Upload
        </button>
      </div>

      {/* Danger Zone */}
      {isSuperAdmin && (
        <div className="detail-card danger-card">
          <div>
            <div className="danger-card-title">
              <i className="fas fa-exclamation-triangle" style={{ color: '#dc3545', marginRight: 8 }}></i>
              Delete all Tickets Data
            </div>
            <p className="danger-card-note">
              Ensure: Delete Includes All Ticket Data <span className="except">Except Users</span>
            </p>
          </div>

          {phase === 'idle' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" className="btn-danger" onClick={handleFirstClick}>
                <i className="fas fa-trash-alt"></i> Delete All Tickets
              </button>
            </div>
          )}

          {phase === 'countdown' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
              <div style={{
                background: dark ? '#2d261c' : '#fff3cd',
                border: `1px solid ${dark ? '#856404' : '#ffc107'}`,
                borderRadius: 8,
                padding: '16px 20px',
                textAlign: 'center',
              }}>
                <p style={{ margin: '0 0 8px', fontWeight: 600, color: dark ? '#fbbf24' : '#856404' }}>
                  <i className="fas fa-hourglass-half"></i> Please wait before confirming
                </p>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: countdown <= 5 ? '#ef4444' : (dark ? '#fbbf24' : '#856404'),
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {countdown}s
                </div>
                <div style={{
                  background: '#e9ecef',
                  borderRadius: 4,
                  height: 6,
                  marginTop: 8,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    background: countdown <= 5 ? '#dc3545' : '#ffc107',
                    width: `${progressPct}%`,
                    transition: 'width 1s linear, background 0.3s',
                    borderRadius: 4,
                  }} />
                </div>
              </div>
              <button type="button" className="btn-primary" onClick={handleCancel} style={{ alignSelf: 'center' }}>
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          )}

          {phase === 'ready' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
              <div style={{
                background: dark ? '#311b1d' : '#f8d7da',
                border: `1px solid ${dark ? '#991b1b' : '#dc3545'}`,
                borderRadius: 8,
                padding: '16px 20px',
                textAlign: 'center',
              }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, color: dark ? '#f87171' : '#721c24', fontSize: '1.1rem' }}>
                  <i className="fas fa-exclamation-circle"></i> Are you absolutely sure?
                </p>
                <p style={{ margin: 0, color: dark ? '#fca5a5' : '#721c24', fontSize: '0.9rem' }}>
                  This will permanently delete ALL tickets. This action cannot be undone.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button type="button" className="btn-primary" onClick={handleCancel} disabled={deleting}>
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button type="button" className="btn-danger" onClick={handleConfirmDelete} disabled={deleting} style={{
                  animation: 'none',
                  fontWeight: 700,
                }}>
                  {deleting ? (
                    <><i className="fas fa-spinner fa-spin"></i> Deleting...</>
                  ) : (
                    <><i className="fas fa-trash-alt"></i> Yes, Delete Everything</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <BulkUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
}
