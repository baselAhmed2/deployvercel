'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '../../../utils/toast';

export default function StudentNewTicketPage() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [level, setLevel] = useState('4');
  const [term, setTerm] = useState('1');
  const [groupNumber, setGroupNumber] = useState('1');
  const [subjectId, setSubjectId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getSubjects) return;
    setLoadingSubjects(true);
    window.TicketAPI.getSubjects(Number(level) || 1, Number(term) || 1)
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setSubjects(arr);
        if (arr.length > 0 && !subjectId) setSubjectId(arr[0].id ?? arr[0].Id ?? '');
      })
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, [level, term]);

  useEffect(() => {
    if (!subjectId || typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getDoctorsBySubject) return;
    setDoctorId('');
    setLoadingDoctors(true);
    window.TicketAPI.getDoctorsBySubject(subjectId)
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setDoctors(arr);
        if (arr.length > 0) setDoctorId(arr[0].id ?? arr[0].Id ?? '');
      })
      .catch(() => setDoctors([]))
      .finally(() => setLoadingDoctors(false));
  }, [subjectId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.createTicket) {
      showToast('API is not available.', 'error');
      return;
    }
    setSending(true);
    window.TicketAPI.createTicket({
      title: title.trim(),
      body: body.trim(),
      level: Number(level) || 1,
      term: Number(term) || 1,
      groupNumber: Number(groupNumber) || 1,
      doctorId: doctorId.trim(),
      subjectId: subjectId.trim(),
    })
      .then(() => {
        showToast('Ticket submitted successfully. We will get back to you soon.');
        setTimeout(() => router.push('/student'), 1500);
      })
      .catch((err) => {
        setSending(false);
        showToast((err && err.message) ? err.message : 'Failed to submit ticket.', 'error');
      });
  };

  return (
    <>
      <h1 className="page-title">New Ticket</h1>
      <section className="form-section">
        <h2 className="section-title">Create Quick Ticket</h2>
        <p className="section-desc">Write and address new queries and issues</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Choose Level <span className="required">*</span></label>
              <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)} required>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Choose Semester <span className="required">*</span></label>
              <select className="form-select" value={term} onChange={(e) => setTerm(e.target.value)} required>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Choose Subject <span className="required">*</span></label>
              <select className="form-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required disabled={loadingSubjects}>
                <option value="">{loadingSubjects ? 'Loading...' : 'Select Subject'}</option>
                {subjects.map((s) => (
                  <option key={s.id ?? s.Id} value={s.id ?? s.Id}>{s.name ?? s.Name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Doctor <span className="required">*</span></label>
              <select className="form-select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required disabled={loadingDoctors || !subjectId}>
                <option value="">{loadingDoctors ? 'Loading...' : 'Choose Doctor'}</option>
                {doctors.map((d) => (
                  <option key={d.id ?? d.Id} value={d.id ?? d.Id}>{d.name ?? d.Name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Group Number <span className="required">*</span></label>
              <select className="form-select" value={groupNumber} onChange={(e) => setGroupNumber(e.target.value)} required>
                {Array.from({ length: 35 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Group {n}</option>
                ))}
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Request Ticket Subject <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="Enter Ticket Subject (min 5 characters)" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={5} maxLength={200} />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Ticket Body <span className="required">*</span></label>
              <textarea className="form-textarea" placeholder="Type ticket issue here.. (min 10 characters)" value={body} onChange={(e) => setBody(e.target.value)} required minLength={10} maxLength={2000}></textarea>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : <><i className="fas fa-paper-plane"></i> Send Ticket</>}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
