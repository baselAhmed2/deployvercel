'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '../../../utils/toast';

const STORAGE_KEY = 'ticket_last_choices';
const LEVEL_KEY = 'ticket_student_level';
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000; // 90 يوم

function loadSavedLevel() {
  try {
    const raw = localStorage.getItem(LEVEL_KEY);
    if (!raw) return null;
    const { value, savedAt } = JSON.parse(raw);
    // تحقق إن المدة ما عدتش 3 شهور
    if (Date.now() - savedAt < THREE_MONTHS_MS) return value;
    localStorage.removeItem(LEVEL_KEY); // منتهي الصلاحية
    return null;
  } catch {
    return null;
  }
}

function saveLevel(value) {
  try {
    localStorage.setItem(LEVEL_KEY, JSON.stringify({ value, savedAt: Date.now() }));
  } catch { }
}

function loadSavedChoices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveChoices(choices) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
  } catch { }
}

export default function StudentNewTicketPage() {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  // استرجع القيم المحفوظة، أو استخدم الـ default (level 1 للمرة الأولى)
  const saved = useRef(null);
  const [level, setLevel] = useState('1');
  const [term, setTerm] = useState('1');
  const [groupNumber, setGroupNumber] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // تحميل الاختيارات المحفوظة عند أول تحميل للصفحة
  useEffect(() => {
    // Level: مع صلاحية 3 شهور
    const savedLevel = loadSavedLevel();
    if (savedLevel) setLevel(savedLevel);

    // باقي الاختيارات بدون صلاحية (تُحفظ لكل submit)
    const prev = loadSavedChoices();
    if (prev) {
      saved.current = prev;
      if (prev.term) setTerm(prev.term);
      if (prev.groupNumber) setGroupNumber(prev.groupNumber);
      // subjectId و doctorId يُستعادان بعد تحميل قوائم المواد والدكاترة
    }
  }, []);

  // تحميل المواد عند تغيير اللفل أو الترم
  useEffect(() => {
    if (typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getSubjects) return;
    setLoadingSubjects(true);
    window.TicketAPI.getSubjects(Number(level) || 1, Number(term) || 1)
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setSubjects(arr);

        // استرجع الـ subject المحفوظ لو موجود في القائمة دي
        // لو أول مرة (مفيش محفوظ) → يفضل فاضي عشان الطالب يختار بنفسه
        const savedSubjectId = saved.current?.subjectId;
        if (savedSubjectId && arr.some((s) => (s.id ?? s.Id) === savedSubjectId)) {
          setSubjectId(savedSubjectId);
        } else {
          setSubjectId('');
        }
      })
      .catch(() => { setSubjects([]); setSubjectId(''); })
      .finally(() => setLoadingSubjects(false));
  }, [level, term]);

  // تحميل الدكاترة عند تغيير المادة
  useEffect(() => {
    if (!subjectId || typeof window.TicketAPI === 'undefined' || !window.TicketAPI.getDoctorsBySubject) return;
    setLoadingDoctors(true);
    window.TicketAPI.getDoctorsBySubject(subjectId)
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setDoctors(arr);

        // استرجع الدكتور المحفوظ لو موجود في القائمة دي
        // لو أول مرة (مفيش محفوظ) → يفضل فاضي عشان الطالب يختار بنفسه
        const savedDoctorId = saved.current?.doctorId;
        if (savedDoctorId && arr.some((d) => (d.id ?? d.Id) === savedDoctorId)) {
          setDoctorId(savedDoctorId);
        } else {
          setDoctorId('');
        }
      })
      .catch(() => { setDoctors([]); setDoctorId(''); })
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
        // احفظ اختيارات الطالب بعد الإرسال الناجح
        saveChoices({ level, term, groupNumber, subjectId, doctorId });
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
              <select className="form-select" value={level} onChange={(e) => { setLevel(e.target.value); saveLevel(e.target.value); }} required>
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
                <option value="">Select Group</option>
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
