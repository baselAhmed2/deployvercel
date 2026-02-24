'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '../../../utils/toast';

function getStored(key) {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

export default function AdminAddSubject() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('1');
  const [term, setTerm] = useState('1');
  const [program, setProgram] = useState('BIS');
  const [saving, setSaving] = useState(false);

  const userRole = getStored('userRole');
  const userProgram = getStored('userProgram');
  const isSubAdmin = userRole === 'SubAdmin';

  useEffect(() => {
    if (isSubAdmin && userProgram) {
      setProgram(userProgram);
    }
  }, [isSubAdmin, userProgram]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.createSubject) {
      showToast('API is not available.', 'error');
      return;
    }
    setSaving(true);
    window.TicketAPI.createSubject({
      id: id.trim(),
      name: name.trim(),
      level: Number(level) || 1,
      term: Number(term) || 1,
      program: isSubAdmin ? userProgram : program,
    })
      .then(() => {
        showToast('Subject added successfully.');
        setId('');
        setName('');
        setLevel('1');
        setTerm('1');
        if (!isSubAdmin) setProgram('BIS');
      })
      .catch((err) => {
        showToast((err && err.message) ? err.message : 'Failed to add subject.', 'error');
      })
      .finally(() => setSaving(false));
  };

  return (
    <>
      <div className="toolbar-row" style={{ marginBottom: 20 }}>
        <h1 className="page-title">Add Subject</h1>
        <Link href="/administrator" className="btn-primary">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </Link>
      </div>
      <section className="form-section">
        <h2 className="section-title">Create Subject</h2>
        <p className="section-desc">Add a new subject/course to the system</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Subject ID <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="e.g. CS101" value={id} onChange={(e) => setId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Name <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="Enter subject name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Level <span className="required">*</span></label>
              <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)} required>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Term <span className="required">*</span></label>
              <select className="form-select" value={term} onChange={(e) => setTerm(e.target.value)} required>
                <option value="1">Term 1</option>
                <option value="2">Term 2</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Program <span className="required">*</span></label>
              {isSubAdmin ? (
                <input type="text" className="form-input" value={userProgram || 'N/A'} readOnly style={{ background: '#f0f0f0' }} />
              ) : (
                <select className="form-select" value={program} onChange={(e) => setProgram(e.target.value)} required>
                  <option value="BIS">BIS</option>
                  <option value="FMI">FMI</option>
                  <option value="CS">CS</option>
                </select>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </section>
    </>
  );
}
