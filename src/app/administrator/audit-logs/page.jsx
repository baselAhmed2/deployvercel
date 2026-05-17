'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '../../../hooks/useDarkMode';
import { TicketAPI } from '../../../lib/api';

const ACTION_LABELS = {
  ADMIN_PASSWORD_RESET: { label: 'Password Reset (Admin)', color: '#dc3545', icon: 'fa-key' },
  SELF_PASSWORD_CHANGE: { label: 'Password Changed (Self)', color: '#fd7e14', icon: 'fa-lock' },
  ADMIN_UPDATE_SSN: { label: 'SSN Updated', color: '#6f42c1', icon: 'fa-id-card' },
  ADMIN_UPDATE_IDENTITY: { label: 'ID Changed', color: '#0dcaf0', icon: 'fa-user-edit' },
  ADMIN_UPDATE_NAME: { label: 'Name Changed', color: '#20c997', icon: 'fa-signature' },
  ADMIN_CREATE_USER: { label: 'User Created', color: '#28a745', icon: 'fa-user-plus' },
  ADMIN_DELETE_USER: { label: 'User Deleted', color: '#dc3545', icon: 'fa-user-minus' },
};

export default function SystemLogsPage() {
  const dark = useDarkMode();

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsActionFilter, setLogsActionFilter] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [logsPagination, setLogsPagination] = useState({ totalPages: 1, totalCount: 0 });

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const isSuperAdmin = userRole === 'SuperAdmin';

  const fetchLogs = useCallback((page = 1, search = logsSearch, actionType = logsActionFilter) => {
    if (!isSuperAdmin) {
        setLogsLoading(false);
        return;
    }
    setLogsLoading(true);
    TicketAPI.getSystemLogs({ pageIndex: page, pageSize: 20, userIdFilter: search, actionType, search })
      .then((res) => {
        setLogs(res?.data ?? res?.Data ?? []);
        setLogsPagination({ totalPages: res?.totalPages ?? 1, totalCount: res?.totalCount ?? 0 });
      })
      .catch(() => {})
      .finally(() => setLogsLoading(false));
  }, [isSuperAdmin, logsSearch, logsActionFilter]);

  useEffect(() => {
    fetchLogs(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="fade-in" style={{ padding: 40, textAlign: 'center' }}>
        <i className="fas fa-lock" style={{ fontSize: '3rem', color: '#dc3545', marginBottom: 16 }}></i>
        <h2>Access Denied</h2>
        <p>You do not have permission to view system audit logs.</p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      <div className="toolbar-row" style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-shield-alt"></i>
          </span>
          System Audit Logs
        </h1>
      </div>

      <div className="detail-card" style={{ padding: 'clamp(20px, 4vw, 32px)', borderRadius: 16, border: '1px solid #edf2f7', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: dark ? '#e2e8f0' : '#1a202c', margin: '0 0 4px 0' }}>Activity Overview</h2>
            <p style={{ margin: 0, color: dark ? '#94a3b8' : '#6c757d', fontSize: '0.9rem' }}>
              Monitoring {logsPagination.totalCount} critical security and administrative events.
            </p>
          </div>
          <button className="btn-primary" onClick={() => { fetchLogs(1, logsSearch, logsActionFilter); setLogsPage(1); }} disabled={logsLoading} style={{ fontSize: '0.9rem', padding: '8px 16px', borderRadius: 8 }}>
            <i className={`fas ${logsLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i> Refresh Logs
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', background: dark ? '#1e293b' : '#f8fafc', padding: 16, borderRadius: 12, border: `1px solid ${dark ? '#334155' : '#e2e8f0'}` }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
            <input
              type="text"
              placeholder="Search by User ID, Target ID, or event details..."
              value={logsSearch}
              onChange={(e) => setLogsSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { fetchLogs(1, logsSearch, logsActionFilter); setLogsPage(1); } }}
              style={{ width: '100%', padding: '10px 14px 10px 40px', border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`, borderRadius: 8, background: dark ? '#0f172a' : '#fff', color: dark ? '#f8fafc' : '#1e293b', fontSize: '0.95rem' }}
            />
          </div>
          <select
            value={logsActionFilter}
            onChange={(e) => { setLogsActionFilter(e.target.value); fetchLogs(1, logsSearch, e.target.value); setLogsPage(1); }}
            style={{ padding: '10px 14px', border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`, borderRadius: 8, background: dark ? '#0f172a' : '#fff', color: dark ? '#f8fafc' : '#1e293b', fontSize: '0.95rem', minWidth: 200, flex: '0 1 auto' }}
          >
            <option value="">All Event Types</option>
            {Object.entries(ACTION_LABELS).map(([key, v]) => (
              <option key={key} value={key}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {logsLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', marginBottom: 16, color: '#6f42c1' }}></i>
            <p style={{ fontSize: '1.1rem' }}>Loading secure logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', background: dark ? '#1e293b' : '#f8fafc', borderRadius: 12, border: `1px dashed ${dark ? '#334155' : '#cbd5e1'}` }}>
            <i className="fas fa-clipboard-check" style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.5 }}></i>
            <h3 style={{ margin: '0 0 8px 0', color: dark ? '#e2e8f0' : '#475569' }}>No events found</h3>
            <p style={{ margin: 0 }}>Try adjusting your search filters or time range.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${dark ? '#334155' : '#e2e8f0'}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: dark ? '#1e293b' : '#f8fafc', textAlign: 'left' }}>
                  {['Timestamp', 'Action Type', 'Performed By', 'Target User', 'Event Details'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontWeight: 600, color: dark ? '#94a3b8' : '#64748b', borderBottom: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const action = ACTION_LABELS[log.actionType] ?? { label: log.actionType, color: '#64748b', icon: 'fa-circle' };
                  return (
                    <tr key={log.id} style={{ background: idx % 2 === 0 ? 'transparent' : (dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'), borderBottom: `1px solid ${dark ? '#334155' : '#f1f5f9'}`, transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: dark ? '#cbd5e1' : '#64748b', fontWeight: 500 }}>
                        {new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: action.color + '15', color: action.color, padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${action.color}30` }}>
                          <i className={`fas ${action.icon}`}></i>
                          {action.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: dark ? '#f8fafc' : '#334155', fontWeight: 600 }}>{log.actorId}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: dark ? '#cbd5e1' : '#64748b' }}>{log.targetUserId ?? '—'}</td>
                      <td style={{ padding: '14px 16px', color: dark ? '#cbd5e1' : '#64748b', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details ?? ''}>{log.details ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {logsPagination.totalPages > 1 && (
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            <button className="btn-primary" disabled={logsPage <= 1} style={{ padding: '6px 14px', borderRadius: 8, background: dark ? '#1e293b' : '#f8fafc', color: dark ? '#f8fafc' : '#334155', borderColor: dark ? '#334155' : '#e2e8f0' }}
              onClick={() => { const p = logsPage - 1; setLogsPage(p); fetchLogs(p, logsSearch, logsActionFilter); }}>
              <i className="fas fa-chevron-left"></i>
            </button>
            {(() => {
              const total = logsPagination.totalPages;
              const items = [];
              const show = new Set([1, total, logsPage, logsPage - 1, logsPage + 1]);
              let last = 0;
              for (let i = 1; i <= total; i++) {
                if (show.has(i)) {
                  if (last > 0 && i - last > 1) items.push(<span key={`e${i}`} style={{ padding: '6px 10px', color: '#94a3b8' }}>…</span>);
                  items.push(
                    <button key={i} onClick={() => { setLogsPage(i); fetchLogs(i, logsSearch, logsActionFilter); }}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${i === logsPage ? '#6f42c1' : (dark ? '#334155' : '#e2e8f0')}`, background: i === logsPage ? '#6f42c1' : (dark ? '#1e293b' : '#fff'), color: i === logsPage ? '#fff' : (dark ? '#f8fafc' : '#334155'), cursor: 'pointer', fontWeight: i === logsPage ? 700 : 500, transition: 'all 0.2s' }}>
                      {i}
                    </button>
                  );
                  last = i;
                }
              }
              return items;
            })()}
            <button className="btn-primary" disabled={logsPage >= logsPagination.totalPages} style={{ padding: '6px 14px', borderRadius: 8, background: dark ? '#1e293b' : '#f8fafc', color: dark ? '#f8fafc' : '#334155', borderColor: dark ? '#334155' : '#e2e8f0' }}
              onClick={() => { const p = logsPage + 1; setLogsPage(p); fetchLogs(p, logsSearch, logsActionFilter); }}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
