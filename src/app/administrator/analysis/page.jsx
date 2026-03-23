'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function AdminAnalysis() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [program, setProgram] = useState('');
  const [doctorLevel, setDoctorLevel] = useState('');
  const [subjectLevel, setSubjectLevel] = useState('');
  const [topDoctors, setTopDoctors] = useState([]);
  const [topSubjects, setTopSubjects] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const PROGRAMS = [
    { value: '', label: 'All Programs' },
    { value: 'BIS', label: 'BIS' },
    { value: 'FMI', label: 'FMI' },
    { value: 'SBS', label: 'SBS' },
  ];

  const fetchAnalytics = useCallback((prog) => {
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getAdminAnalytics) return;
    setLoading(true);
    window.TicketAPI.getAdminAnalytics(null, prog || null)
      .then((data) => {
        setAnalytics(data);
        setTopDoctors(data?.topDoctorsByTickets ?? data?.TopDoctorsByTickets ?? []);
        setTopSubjects(data?.topSubjectsByTickets ?? data?.TopSubjectsByTickets ?? []);
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAnalytics(''); }, [fetchAnalytics]);

  const handleProgramChange = (prog) => {
    setProgram(prog);
    setDoctorLevel('');
    setSubjectLevel('');
    fetchAnalytics(prog);
    fetchTopDoctors(null, prog);
    fetchTopSubjects(null, prog);
  };

  const fetchTopDoctors = useCallback((level, prog) => {
    if (!window.TicketAPI?.getTopDoctors) return;
    setLoadingDoctors(true);
    window.TicketAPI.getTopDoctors(10, level || null, (prog ?? program) || null)
      .then(setTopDoctors)
      .catch(() => { })
      .finally(() => setLoadingDoctors(false));
  }, [program]);

  const fetchTopSubjects = useCallback((level, prog) => {
    if (!window.TicketAPI?.getTopSubjects) return;
    setLoadingSubjects(true);
    window.TicketAPI.getTopSubjects(10, level || null, (prog ?? program) || null)
      .then(setTopSubjects)
      .catch(() => { })
      .finally(() => setLoadingSubjects(false));
  }, [program]);

  const handleDoctorLevelChange = (e) => {
    const val = e.target.value;
    setDoctorLevel(val);
    fetchTopDoctors(val, program);
  };

  const handleSubjectLevelChange = (e) => {
    const val = e.target.value;
    setSubjectLevel(val);
    fetchTopSubjects(val, program);
  };

  if (loading) {
    return (
      <>
        <h1 className="page-title">Analysis</h1>
        <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>
      </>
    );
  }

  const byStatus = analytics?.ticketsByStatus ?? analytics?.TicketsByStatus ?? {};
  const dist = byStatus.distribution ?? byStatus.Distribution ?? {};
  const newCount = dist['New'] ?? dist['1'] ?? 0;
  const inProgressCount = dist['InProgress'] ?? dist['2'] ?? 0;
  const closedCount = dist['Closed'] ?? dist['3'] ?? 0;
  const rejectedCount = dist['Rejected'] ?? dist['4'] ?? 0;
  const totalTickets = analytics?.totalTickets ?? analytics?.TotalTickets ?? 0;
  const totalUsers = analytics?.totalUsers ?? analytics?.TotalUsers ?? 0;
  const totalDoctors = analytics?.totalDoctors ?? analytics?.TotalDoctors ?? 0;
  const totalStudents = analytics?.totalStudents ?? analytics?.TotalStudents ?? 0;

  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: '1', label: 'Level 1' },
    { value: '2', label: 'Level 2' },
    { value: '3', label: 'Level 3' },
    { value: '4', label: 'Level 4' },
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Analysis</h1>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={program}
          onChange={(e) => handleProgramChange(e.target.value)}
          aria-label="Filter by program"
        >
          {PROGRAMS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      {error && <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error}</p>}
      <div className="detail-card">
        <h2 className="section-title">Ticket Statistics</h2>
        <p className="section-desc">Overview of tickets by status</p>
        <div className="stat-cards">
          <Link href="/administrator/tickets?status=new" className="stat-card teal">
            <div className="stat-card-value">{newCount}</div>
            <div className="stat-card-label">New</div>
            <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-envelope"></i></div>
          </Link>
          <Link href="/administrator/tickets?status=ongoing" className="stat-card yellow">
            <div className="stat-card-value">{inProgressCount}</div>
            <div className="stat-card-label">In Progress</div>
            <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-spinner"></i></div>
          </Link>
          <Link href="/administrator/tickets?status=resolved" className="stat-card pink">
            <div className="stat-card-value">{closedCount}</div>
            <div className="stat-card-label">Closed</div>
            <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-check-circle"></i></div>
          </Link>
          <Link href="/administrator/tickets?status=rejected" className="stat-card" style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)', color: '#fff' }}>
            <div className="stat-card-value">{rejectedCount}</div>
            <div className="stat-card-label">Rejected</div>
            <div className="stat-card-illus" aria-hidden="true"><i className="fas fa-ban"></i></div>
          </Link>
        </div>
      </div>
      <div className="detail-card" style={{ marginTop: 24 }}>
        <h2 className="section-title">Overview</h2>
        <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
          <div className="info-item"><label>Total Tickets</label><span className="value">{totalTickets}</span></div>
          <div className="info-item"><label>Total Users</label><span className="value">{totalUsers}</span></div>
          <div className="info-item"><label>Doctors</label><span className="value">{totalDoctors}</span></div>
          <div className="info-item"><label>Students</label><span className="value">{totalStudents}</span></div>
        </div>
      </div>

      <div className="detail-card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Top Doctors by Tickets</h2>
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={doctorLevel} onChange={handleDoctorLevelChange}>
            {levelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {loadingDoctors ? (
          <p style={{ padding: 12 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>
        ) : topDoctors.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '8px 4px' }}>#</th>
                <th style={{ padding: '8px 4px' }}>Doctor</th>
                <th style={{ padding: '8px 4px' }}>Total</th>
                <th style={{ padding: '8px 4px' }}>New</th>
                <th style={{ padding: '8px 4px' }}>In Progress</th>
                <th style={{ padding: '8px 4px' }}>Closed</th>
                <th style={{ padding: '8px 4px' }}>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {topDoctors.slice(0, 10).map((d, i) => (
                <tr key={d.doctorId ?? d.DoctorId ?? i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px 4px', color: '#888' }}>{i + 1}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 500 }}>{d.doctorName ?? d.DoctorName ?? '—'}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>{d.ticketCount ?? d.TicketCount ?? 0}</td>
                  <td style={{ padding: '8px 4px', color: '#20c997' }}>{d.newCount ?? d.NewCount ?? 0}</td>
                  <td style={{ padding: '8px 4px', color: '#ffc107' }}>{d.inProgressCount ?? d.InProgressCount ?? 0}</td>
                  <td style={{ padding: '8px 4px', color: '#e83e8c' }}>{d.closedCount ?? d.ClosedCount ?? 0}</td>
                  <td style={{ padding: '8px 4px', color: '#dc3545' }}>{d.rejectedCount ?? d.RejectedCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#666', padding: 12 }}>No data available.</p>
        )}
      </div>

      <div className="detail-card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Top Subjects by Tickets</h2>
          <select className="form-select" style={{ width: 'auto', minWidth: 140 }} value={subjectLevel} onChange={handleSubjectLevelChange}>
            {levelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {loadingSubjects ? (
          <p style={{ padding: 12 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>
        ) : topSubjects.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '8px 4px' }}>#</th>
                <th style={{ padding: '8px 4px' }}>Subject</th>
                <th style={{ padding: '8px 4px' }}>Level</th>
                <th style={{ padding: '8px 4px' }}>Tickets</th>
              </tr>
            </thead>
            <tbody>
              {topSubjects.slice(0, 10).map((s, i) => (
                <tr key={s.subjectId ?? s.SubjectId ?? i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px 4px', color: '#888' }}>{i + 1}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 500 }}>{s.subjectName ?? s.SubjectName ?? '—'}</td>
                  <td style={{ padding: '8px 4px' }}>Level {s.level ?? s.Level ?? '—'}</td>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>{s.ticketCount ?? s.TicketCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#666', padding: 12 }}>No data available.</p>
        )}
      </div>
    </>
  );
}
