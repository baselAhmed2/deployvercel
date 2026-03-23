'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DoctorMyCourses() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getDoctorSubjects) {
      setLoading(false);
      setError('API is not available.');
      return;
    }
    window.TicketAPI.getDoctorSubjects()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setSubjects(arr);
      })
      .catch((err) => {
        setError((err && err.message) ? err.message : 'Failed to load courses.');
        setSubjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <h1 className="page-title">My Courses</h1>
        <p style={{ textAlign: 'center', padding: 24 }}><i className="fas fa-spinner fa-spin"></i> Loading...</p>
      </>
    );
  }

  return (
    <>
      <h1 className="page-title">My Courses</h1>
      {error && <p role="alert" style={{ color: '#dc3545', padding: 16 }}>{error}</p>}
      <div className="courses-grid">
        {subjects.length === 0 && !error ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32, color: '#666' }}>No courses assigned yet.</p>
        ) : (
          subjects.map((s) => {
            const subjectId = s.subjectId ?? s.SubjectId ?? '';
            const subjectName = s.subjectName ?? s.SubjectName ?? 'Course';
            const totalTickets = s.totalTickets ?? s.TotalTickets ?? 0;
            const level = s.level ?? s.Level ?? '';
            const term = s.term ?? s.Term ?? '';
            const label = level || term ? `${subjectName} (L${level} T${term})` : subjectName;
            return (
              <Link key={subjectId} href={`/doctor/tickets?course=${encodeURIComponent(subjectId)}`} className="course-card">
                <span className="course-card-title">{label}</span>
                <span className="course-card-illus" aria-hidden="true"><i className="fas fa-book"></i></span>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
