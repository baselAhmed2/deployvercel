'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { showToast } from '../../../utils/toast';

export default function AdminMySubjects() {
  const [mySubjects, setMySubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState(null);

  const loadData = () => {
    if (typeof window.TicketAPI === 'undefined') {
      setLoading(false);
      return;
    }
    const api = window.TicketAPI;
    Promise.all([
      api.getAdminMySubjects ? api.getAdminMySubjects() : Promise.resolve([]),
      api.getAdminSubjects ? api.getAdminSubjects() : Promise.resolve([]),
    ])
      .then(([myList, allList]) => {
        setMySubjects(Array.isArray(myList) ? myList : []);
        setAllSubjects(Array.isArray(allList) ? allList : []);
      })
      .catch((err) => setError((err && err.message) ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const myIds = new Set(mySubjects.map((s) => s.subjectId ?? s.SubjectId ?? s.id ?? s.Id));
  const availableToAdd = allSubjects.filter((s) => !myIds.has(s.id ?? s.Id));

  const handleAssign = (subjectId) => {
    if (!window.TicketAPI?.adminAssignSelfToSubject) return;
    setAssigning(subjectId);
    window.TicketAPI.adminAssignSelfToSubject(subjectId)
      .then(() => {
        showToast('Added to subject.');
        loadData();
      })
      .catch((err) => showToast((err && err.message) ? err.message : 'Failed.', 'error'))
      .finally(() => setAssigning(null));
  };

  const handleUnassign = (subjectId) => {
    if (!window.TicketAPI?.adminRemoveSelfFromSubject) return;
    setAssigning(subjectId);
    window.TicketAPI.adminRemoveSelfFromSubject(subjectId)
      .then(() => {
        showToast('Removed from subject.');
        loadData();
      })
      .catch((err) => showToast((err && err.message) ? err.message : 'Failed.', 'error'))
      .finally(() => setAssigning(null));
  };

  if (loading) {
    return (
      <>
        <h1 className="page-title">My Subjects</h1>
        <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">My Subjects</h1>
      <p className="section-desc" style={{ marginBottom: 20 }}>
        Subjects you teach. Tickets for these subjects appear in My Tickets on the dashboard.
      </p>
      {error && <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error}</p>}

      <h2 className="section-heading">Assigned Subjects</h2>
      <div className="courses-grid">
        {mySubjects.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32, color: '#666' }}>
            No subjects assigned yet. Add yourself to subjects below.
          </p>
        ) : (
          mySubjects.map((s) => {
            const subjectId = s.subjectId ?? s.SubjectId ?? s.id ?? s.Id ?? '';
            const subjectName = s.subjectName ?? s.SubjectName ?? s.name ?? s.Name ?? 'Course';
            const totalTickets = s.totalTickets ?? s.TotalTickets ?? 0;
            const level = s.level ?? s.Level ?? '';
            const term = s.term ?? s.Term ?? '';
            const label = level || term ? `${subjectName} (L${level} T${term})` : subjectName;
            return (
              <div key={subjectId} className="course-card" style={{ position: 'relative' }}>
                <Link href={`/administrator/tickets?my=1`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span className="course-card-title">{label}</span>
                  <span className="course-card-illus" aria-hidden="true"><i className="fas fa-book"></i></span>
                  {totalTickets > 0 && (
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginTop: 4 }}>{totalTickets} ticket(s)</span>
                  )}
                </Link>
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.75rem', padding: '2px 6px' }}
                  onClick={(e) => { e.preventDefault(); handleUnassign(subjectId); }}
                  disabled={assigning === subjectId}
                >
                  {assigning === subjectId ? '...' : 'Remove'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {availableToAdd.length > 0 && (
        <>
          <h2 className="section-heading" style={{ marginTop: 28 }}>Add to Subject</h2>
          <div className="courses-grid">
            {availableToAdd.map((s) => {
              const subjectId = s.id ?? s.Id ?? '';
              const subjectName = s.name ?? s.Name ?? 'Course';
              const level = s.level ?? s.Level ?? '';
              const term = s.term ?? s.Term ?? '';
              const label = level || term ? `${subjectName} (L${level} T${term})` : subjectName;
              return (
                <div key={subjectId} className="course-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span className="course-card-title">{label}</span>
                  <span className="course-card-illus" aria-hidden="true"><i className="fas fa-plus"></i></span>
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                    onClick={() => handleAssign(subjectId)}
                    disabled={assigning === subjectId}
                  >
                    {assigning === subjectId ? '...' : 'Add me'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
