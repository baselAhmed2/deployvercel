/**
 * Ticket API – نفس واجهة الـ API القديمة (api.js) لتوافق مع الصفحات.
 * Base URL من متغير البيئة VITE_API_BASE_URL أو افتراضي.
 */

const BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : '';

function request(path, options = {}) {
  const url = BASE ? `${BASE.replace(/\/$/, '')}${path}` : path;
  return fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  }).then((res) => {
    if (!res.ok) {
      if (res.status === 401) {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          localStorage.removeItem('userId');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userProgram');
          sessionStorage.removeItem('token');
        } catch (_) { }
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
      const err = new Error(res.statusText || 'Request failed');
      err.status = res.status;
      return res.json().then((body) => { err.message = body?.message || err.message; throw err; }).catch(() => { throw err; });
    }
    return res.headers.get('content-type')?.includes('json') ? res.json() : res.text();
  });
}

export const TicketAPI = {
  login(studentId, password) {
    const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL;
    if (!base) {
      return Promise.resolve({ ok: true });
    }
    return request('/api/login', { method: 'POST', body: JSON.stringify({ studentId, password }) });
  },
  resetPassword({ studentId, email, nationalId }) {
    return request('/api/reset-password', { method: 'POST', body: JSON.stringify({ studentId, email, nationalId }) });
  },
  createTicket(payload) {
    if (!BASE) return Promise.resolve({ ok: true });
    return request('/api/tickets', { method: 'POST', body: JSON.stringify(payload) });
  },
  replyToTicket(ticketId, { body, subject, status }) {
    if (!BASE) return Promise.resolve({ ok: true });
    return request(`/api/tickets/${ticketId}/reply`, { method: 'POST', body: JSON.stringify({ body, subject, status }) });
  },
  createUser({ accountLevel, userId, ssn }) {
    return request('/api/users', { method: 'POST', body: JSON.stringify({ accountLevel, userId, ssn }) });
  },
  registerStudent(payload) {
    if (!BASE) return Promise.resolve({ ok: true });
    return request('/api/Auth/register', { method: 'POST', body: JSON.stringify(payload) });
  },
  verifyOtp(payload) {
    if (!BASE) return Promise.resolve({ ok: true });
    return request('/api/Auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) });
  },
  addCourse({ courseId, courseName }) {
    return request('/api/courses', { method: 'POST', body: JSON.stringify({ courseId, courseName }) });
  },
  deleteAllTickets() {
    return request('/api/tickets/all', { method: 'DELETE' });
  },

  // =====================
  // Admin-as-Doctor APIs
  // =====================
  getAdminSubjects() {
    if (!BASE) return Promise.resolve([]);
    return request('/api/admin/subjects');
  },
  getMySubjects() {
    if (!BASE) return Promise.resolve([]);
    return request('/api/admin/my-subjects');
  },
  assignSelfToSubject(subjectId) {
    if (!BASE) return Promise.resolve({ message: 'Assigned successfully' });
    return request(`/api/admin/subjects/${subjectId}/assign-self`, { method: 'POST' });
  },
  unassignSelfFromSubject(subjectId) {
    if (!BASE) return Promise.resolve({ message: 'Unassigned successfully' });
    return request(`/api/admin/subjects/${subjectId}/unassign-self`, { method: 'DELETE' });
  },
  getMyDoctorTickets(pageIndex = 1, pageSize = 10) {
    if (!BASE) return Promise.resolve({ data: [], totalCount: 0, pageIndex, pageSize });
    return request(`/api/admin/my-doctor-tickets?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  clearAuth() {
    // محل التخزين أو التوكن حسب تطبيقك
    try { localStorage.removeItem('token'); sessionStorage.removeItem('token'); } catch (_) { }
  },
};

export default TicketAPI;
