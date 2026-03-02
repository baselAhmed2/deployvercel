'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { showToast } from '../../../utils/toast';

const LEVEL_COLORS = {
  1: { bg: '#e8f5e9', border: '#66bb6a', dot: '#43a047' },
  2: { bg: '#e3f2fd', border: '#42a5f5', dot: '#1e88e5' },
  3: { bg: '#fff3e0', border: '#ffa726', dot: '#fb8c00' },
  4: { bg: '#fce4ec', border: '#ef5350', dot: '#e53935' },
};

function getLevelStyle(level) {
  return LEVEL_COLORS[level] || { bg: '#f5f5f5', border: '#bdbdbd', dot: '#757575' };
}

export default function AdminAddCourse() {
  const [doctorId, setDoctorId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [subjectIds, setSubjectIds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [currentSubjects, setCurrentSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errorDoctor, setErrorDoctor] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load subjects once on mount (needed for the assignment grid)
  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined') { setLoading(false); return; }
    const api = window.TicketAPI;
    (api.getAdminSubjects ? api.getAdminSubjects() : Promise.resolve([]))
      .then((subs) => setSubjects(Array.isArray(subs) ? subs : []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Debounced doctor search — hits API only when user pauses typing
  useEffect(() => {
    const q = searchDoctor.trim();
    if (!q) {
      setDoctors([]);
      return;
    }
    const handler = setTimeout(() => {
      if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getAdminUsers) return;
      setLoadingDoctors(true);
      const api = window.TicketAPI;
      Promise.all([
        api.getAdminUsers(1, 20, q, 'Doctor').then((r) => (r?.data ?? r?.Data ?? [])),
        api.getAdminUsers(1, 10, q, 'SuperAdmin').then((r) => (r?.data ?? r?.Data ?? [])),
        api.getAdminUsers(1, 10, q, 'SubAdmin').then((r) => (r?.data ?? r?.Data ?? [])),
      ])
        .then(([docs, supers, subs]) => {
          const merged = [
            ...docs.map((u) => ({ ...u, _roleLabel: 'Doctor' })),
            ...supers.map((u) => ({ ...u, _roleLabel: 'SuperAdmin' })),
            ...subs.map((u) => ({ ...u, _roleLabel: 'SubAdmin' })),
          ];
          setDoctors(merged);
        })
        .catch(() => setDoctors([]))
        .finally(() => setLoadingDoctors(false));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchDoctor]);


  useEffect(() => {
    if (!doctorId || typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getAdminDoctorSubjects) {
      setCurrentSubjects([]);
      return;
    }
    setLoadingCurrent(true);
    window.TicketAPI.getAdminDoctorSubjects(doctorId)
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setCurrentSubjects(list);
        setSubjectIds(list.map((s) => s.id ?? s.Id));
      })
      .catch(() => setCurrentSubjects([]))
      .finally(() => setLoadingCurrent(false));
  }, [doctorId]);

  const toggleSubject = (id) => {
    if (!doctorId) {
      setErrorDoctor(true);
      showToast('Select a doctor first.', 'error');
      return;
    }
    setSubjectIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAll = () => {
    if (!doctorId) {
      setErrorDoctor(true);
      showToast('Select a doctor first.', 'error');
      return;
    }
    setSubjectIds(subjects.map((s) => s.id ?? s.Id));
  };
  const clearAll = () => {
    if (!doctorId) {
      setErrorDoctor(true);
      showToast('Select a doctor first.', 'error');
      return;
    }
    setSubjectIds([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!doctorId) {
      setErrorDoctor(true);
      showToast('Select a doctor first.', 'error');
      return;
    }
    if (subjectIds.length === 0) {
      showToast('Select at least one subject.', 'error');
      return;
    }
    if (!window.TicketAPI?.assignSubjectsToDoctor) {
      showToast('API is not available.', 'error');
      return;
    }
    setSaving(true);
    window.TicketAPI.assignSubjectsToDoctor(doctorId, subjectIds)
      .then(() => {
        showToast('Subjects assigned successfully.');
        setCurrentSubjects(subjects.filter((s) => subjectIds.includes(s.id ?? s.Id)));
      })
      .catch((err) => showToast((err && err.message) ? err.message : 'Failed to assign subjects.', 'error'))
      .finally(() => setSaving(false));
  };

  const selectedDoctorName = selectedDoctor ? (selectedDoctor.name ?? selectedDoctor.Name ?? selectedDoctor.userName ?? selectedDoctor.UserName) : '';

  const groupedByLevel = {};
  subjects.forEach((s) => {
    const lvl = s.level ?? s.Level ?? 0;
    if (!groupedByLevel[lvl]) groupedByLevel[lvl] = [];
    groupedByLevel[lvl].push(s);
  });
  const sortedLevels = Object.keys(groupedByLevel).sort((a, b) => a - b);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Assign Subjects to Doctor</h1>
        <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>
      </>
    );
  }

  return (
    <>
      <div className="toolbar-row" style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Assign Subjects to Doctor</h1>
        <Link href="/administrator" className="btn-primary">
          <i className="fas fa-arrow-left"></i> Back
        </Link>
      </div>

      {/* Step 1: Select Doctor */}
      <div className="detail-card" style={{ marginBottom: 20 }}>
        <h2 className="section-title"><i className="fas fa-user-md" style={{ color: '#6f42c1', marginRight: 8 }}></i>Step 1: Select Doctor</h2>
        <p className="section-desc">Choose the doctor to assign subjects to</p>
        <div style={{ maxWidth: 440, position: 'relative' }} ref={dropdownRef}>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: '#aaa', pointerEvents: 'none', fontSize: '0.9rem',
            }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search doctor by name or ID..."
              value={searchDoctor}
              autoComplete="off"
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => { setSearchDoctor(e.target.value); setDropdownOpen(true); }}
              style={{
                paddingLeft: 36,
                width: '100%',
                borderColor: errorDoctor ? '#ef4444' : undefined,
                boxShadow: errorDoctor ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : undefined
              }}
            />
            {searchDoctor && (
              <button
                type="button"
                onClick={() => { setSearchDoctor(''); setDoctorId(''); setSelectedDoctor(null); setDropdownOpen(false); setErrorDoctor(false); }}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', fontSize: '1rem',
                }}
              >
                <i className="fas fa-times" />
              </button>
            )}
          </div>

          {dropdownOpen && searchDoctor.trim() && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#fff', border: '1px solid #dee2e6', borderRadius: 8,
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)', zIndex: 300,
              maxHeight: 260, overflowY: 'auto',
            }}>
              {loadingDoctors ? (
                <div style={{ padding: '12px 16px', color: '#888', fontSize: '0.9rem' }}>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />Searching...
                </div>
              ) : doctors.length === 0 ? (
                <div style={{ padding: '12px 16px', color: '#888', fontSize: '0.9rem' }}>No results found</div>
              ) : (
                doctors.map((d) => {
                  const did = d.id ?? d.Id;
                  const dname = d.name ?? d.Name ?? d.userName ?? d.UserName ?? '';
                  const prog = d.program ?? d.Program ?? '';
                  const roleLabel = d._roleLabel ?? (d.role ?? d.Role ?? 'Doctor');
                  const isAdmin = roleLabel === 'SuperAdmin' || roleLabel === 'SubAdmin';
                  const isSelected = doctorId === did;
                  return (
                    <div
                      key={did}
                      onMouseDown={() => {
                        setDoctorId(did);
                        setSelectedDoctor(d);
                        setSearchDoctor(dname);
                        setDropdownOpen(false);
                        setErrorDoctor(false);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', cursor: 'pointer',
                        background: isSelected ? 'rgba(111, 66, 193, 0.08)' : '#fff',
                        borderBottom: '1px solid #f1f1f1',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(111, 66, 193, 0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = isSelected ? 'rgba(111, 66, 193, 0.08)' : '#fff'}
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(dname)}&size=32&background=6f42c1&color=fff`}
                        alt=""
                        style={{ borderRadius: '50%', width: 32, height: 32, flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {dname}
                          {isAdmin && (
                            <span style={{ fontSize: '0.7rem', background: '#6f42c1', color: '#fff', borderRadius: 6, padding: '1px 6px' }}>
                              {roleLabel}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#888' }}>
                          {did}{prog ? ` — ${prog}` : ''}
                        </div>
                      </div>
                      {isSelected && <i className="fas fa-check" style={{ marginLeft: 'auto', color: '#6f42c1' }} />}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {doctorId && selectedDoctor && (
          <div style={{
            marginTop: 16,
            padding: '12px 16px',
            background: '#f3e8ff',
            borderRadius: 8,
            border: '1px solid #d8b4fe',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctorName)}&size=40&background=6f42c1&color=fff`}
              alt=""
              style={{ borderRadius: '50%', width: 40, height: 40 }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1rem' }}>{selectedDoctorName}</strong>
                {(() => {
                  const rl = selectedDoctor._roleLabel ?? (selectedDoctor.role ?? selectedDoctor.Role ?? '');
                  const isAdmin = rl === 'SuperAdmin' || rl === 'SubAdmin';
                  return isAdmin ? (
                    <span style={{ fontSize: '0.72rem', background: '#6f42c1', color: '#fff', borderRadius: 8, padding: '2px 8px', fontWeight: 600 }}>
                      {rl}
                    </span>
                  ) : null;
                })()}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b21a8' }}>
                ID: {doctorId} {(selectedDoctor.program ?? selectedDoctor.Program) ? `— ${selectedDoctor.program ?? selectedDoctor.Program}` : ''}
              </div>
            </div>
            {loadingCurrent && <i className="fas fa-spinner fa-spin" style={{ marginLeft: 'auto', color: '#6f42c1' }}></i>}
            {!loadingCurrent && currentSubjects.length > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#6b21a8', fontWeight: 500 }}>
                Currently: {currentSubjects.length} subject(s)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Select Subjects */}
      <form onSubmit={handleSubmit}>
        <div className="detail-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <i className="fas fa-book" style={{ color: '#20c997', marginRight: 8 }}></i>
              Step 2: Select Subjects
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={selectAll} style={{
                fontSize: '0.8rem', padding: '4px 10px', borderRadius: 6, border: '1px solid #20c997',
                background: '#fff', color: '#20c997', cursor: 'pointer', fontWeight: 500,
              }}>
                Select All
              </button>
              <button type="button" onClick={clearAll} style={{
                fontSize: '0.8rem', padding: '4px 10px', borderRadius: 6, border: '1px solid #dc3545',
                background: '#fff', color: '#dc3545', cursor: 'pointer', fontWeight: 500,
              }}>
                Clear All
              </button>
            </div>
          </div>
          <p className="section-desc" style={{ margin: '0 0 16px' }}>
            Selected: <strong>{subjectIds.length}</strong> / {subjects.length} subjects
          </p>

          {subjects.length === 0 ? (
            <p style={{ color: '#666', padding: 12 }}>No subjects available in the system.</p>
          ) : (
            sortedLevels.map((lvl) => {
              const levelSubjects = groupedByLevel[lvl];
              const ls = getLevelStyle(Number(lvl));
              return (
                <div key={lvl} style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: '0.85rem', fontWeight: 600, color: ls.dot,
                    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', background: ls.dot, display: 'inline-block',
                    }}></span>
                    Level {lvl}
                    <span style={{ fontWeight: 400, color: '#888', fontSize: '0.8rem' }}>
                      ({levelSubjects.length} subject{levelSubjects.length > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                    {levelSubjects.map((s) => {
                      const sid = s.id ?? s.Id;
                      const sName = s.name ?? s.Name ?? '';
                      const sTerm = s.term ?? s.Term ?? '';
                      const sProgram = s.program ?? s.Program ?? '';
                      const checked = subjectIds.includes(sid);
                      return (
                        <div
                          key={sid}
                          onClick={() => toggleSubject(sid)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `2px solid ${checked ? ls.dot : '#e9ecef'}`,
                            background: checked ? ls.bg : '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            userSelect: 'none',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSubject(sid)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ accentColor: ls.dot, width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>
                              {sid} — T{sTerm} {sProgram && `— ${sProgram}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Submit */}
        <div className="detail-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: '0.9rem', color: '#495057' }}>
            {doctorId && subjectIds.length > 0 ? (
              <>
                <i className="fas fa-check-circle" style={{ color: '#20c997', marginRight: 6 }}></i>
                Assigning <strong>{subjectIds.length}</strong> subject(s) to <strong>{selectedDoctorName}</strong>
              </>
            ) : (
              <>
                <i className="fas fa-info-circle" style={{ color: '#6c757d', marginRight: 6 }}></i>
                {!doctorId ? 'Select a doctor first' : 'Select at least one subject'}
              </>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || !doctorId || subjectIds.length === 0}
            style={{ minWidth: 160 }}
          >
            {saving ? (
              <><i className="fas fa-spinner fa-spin"></i> Saving...</>
            ) : (
              <><i className="fas fa-save"></i> Save Assignment</>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
