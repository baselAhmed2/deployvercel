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
  addCourse({ courseId, courseName }) {
    return request('/api/courses', { method: 'POST', body: JSON.stringify({ courseId, courseName }) });
  },
  deleteAllTickets() {
    return request('/api/tickets/all', { method: 'DELETE' });
  },
  clearAuth() {
    // محل التخزين أو التوكن حسب تطبيقك
    try { localStorage.removeItem('token'); sessionStorage.removeItem('token'); } catch (_) {}
  },
};

export default TicketAPI;
