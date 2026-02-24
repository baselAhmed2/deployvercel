const BACKEND = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_BASE_URL
  ? process.env.NEXT_PUBLIC_API_BASE_URL
  : '';

// Use proxy when env var not available at build (e.g. Vercel) — proxy reads env at runtime
const USE_PROXY = !BACKEND;
const BASE = USE_PROXY ? '' : BACKEND;
const PROXY_PREFIX = '/api/proxy';

function getAuthHeader() {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (_) {
    return {};
  }
}

function request(path, options = {}) {
  const url = USE_PROXY ? `${PROXY_PREFIX}${path}` : `${BACKEND.replace(/\/$/, '')}${path}`;
  return fetch(url, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader(), ...options.headers },
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
    if (!BACKEND && !USE_PROXY) {
      return Promise.reject(new Error('API URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL.'));
    }
    return request('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ Username: studentId, Password: password }),
    });
  },
  resetPassword({ studentId, email, nationalId }) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/reset-password', { method: 'POST', body: JSON.stringify({ studentId, email, nationalId }) });
  },
  getSubjects(level, term) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Tickets/subjects?level=${level}&term=${term}`);
  },
  getDoctorsBySubject(subjectId) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Tickets/doctors-by-subject/${encodeURIComponent(subjectId)}`);
  },
  getMyTickets(pageIndex = 1, pageSize = 10) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Tickets/my-tickets?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  getTicketById(id) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Tickets/${encodeURIComponent(id)}`);
  },
  getDoctorTickets(pageIndex = 1, pageSize = 10) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Tickets/doctor-tickets?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  getDoctorStats() {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Doctor/stats');
  },
  getDoctorSubjects() {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Doctor/subjects');
  },
  updateTicketStatus(ticketId, status) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Tickets/${encodeURIComponent(ticketId)}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
  },
  createTicket(payload) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Tickets', {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        level: Number(payload.level),
        term: Number(payload.term),
        groupNumber: Number(payload.groupNumber),
        doctorId: payload.doctorId,
        subjectId: payload.subjectId,
      }),
    });
  },
  replyToTicket(ticketId, { body }) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Tickets/reply', {
      method: 'POST',
      body: JSON.stringify({ ticketId, body }),
    });
  },
  getAdminUsers(pageIndex = 1, pageSize = 10, searchTerm = '') {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    const params = new URLSearchParams({ pageIndex, pageSize });
    if (searchTerm) params.set('searchTerm', searchTerm);
    return request(`/api/Admin/users?${params}`);
  },
  getAdminUserById(userId) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Admin/users/${encodeURIComponent(userId)}`);
  },
  createAdminUser(payload) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Admin/users', {
      method: 'POST',
      body: JSON.stringify({
        id: payload.id,
        password: payload.password,
        name: payload.name,
        role: payload.role,
        program: payload.program,
      }),
    });
  },
  deleteAdminUser(userId) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
  },
  getAdminFilteredTickets(filter) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Admin/tickets/filter', {
      method: 'POST',
      body: JSON.stringify({
        level: filter?.level,
        term: filter?.term,
        status: filter?.status,
        doctorId: filter?.doctorId,
        subjectId: filter?.subjectId,
        searchTicketId: filter?.searchTicketId,
        isHighPriority: filter?.isHighPriority,
        program: filter?.program,
        pageIndex: filter?.pageIndex ?? 1,
        pageSize: filter?.pageSize ?? 10,
      }),
    });
  },
  getAdminHighPriorityTickets(pageIndex = 1, pageSize = 10) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Admin/tickets/high-priority?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  markTicketHighPriority(ticketId, isHighPriority) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Admin/tickets/${encodeURIComponent(ticketId)}/high-priority`, {
      method: 'PUT',
      body: JSON.stringify(isHighPriority),
    });
  },
  getAdminSubjects() {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Admin/subjects');
  },
  createSubject(payload) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Admin/subjects', {
      method: 'POST',
      body: JSON.stringify({
        id: payload.id,
        name: payload.name,
        level: Number(payload.level) || 1,
        term: Number(payload.term) || 1,
        program: payload.program,
      }),
    });
  },
  getAdminDoctorSubjects(doctorId) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Admin/doctors/${encodeURIComponent(doctorId)}/subjects`);
  },
  assignSubjectsToDoctor(doctorId, subjectIds) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Admin/doctors/assign-subjects', {
      method: 'POST',
      body: JSON.stringify({ doctorId, subjectIds: subjectIds || [] }),
    });
  },
  getAdminAllTickets(pageIndex = 1, pageSize = 10) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Tickets/all?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  getAdminAnalytics() {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request('/api/Analytics/admin');
  },
  getTopDoctors(count = 10, level = null) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    const params = new URLSearchParams({ count });
    if (level) params.set('level', level);
    return request(`/api/Analytics/top-doctors?${params}`);
  },
  getTopSubjects(count = 10, level = null) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    const params = new URLSearchParams({ count });
    if (level) params.set('level', level);
    return request(`/api/Analytics/top-subjects?${params}`);
  },
  getAdminMessages(pageIndex = 1, pageSize = 20) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Admin/messages?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  adminAssignSelfToSubject(subjectId) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Admin/subjects/${encodeURIComponent(subjectId)}/assign-self`, { method: 'POST' });
  },
  adminRemoveSelfFromSubject(subjectId) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return request(`/api/Admin/subjects/${encodeURIComponent(subjectId)}/unassign-self`, { method: 'DELETE' });
  },
  createUser(payload) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return this.createAdminUser(payload);
  },
  addCourse({ courseId, courseName }) {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return Promise.reject(new Error('Add course is not supported. Use Assign Subjects to Doctor.'));
  },
  deleteAllTickets() {
    if (!BACKEND && !USE_PROXY) return Promise.reject(new Error('API URL is not configured.'));
    return Promise.reject(new Error('Bulk delete is not supported by the API.'));
  },
  clearAuth() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userProgram');
      sessionStorage.removeItem('token');
    } catch (_) {}
  },
};
