const BACKEND = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_BASE_URL
  ? process.env.NEXT_PUBLIC_API_BASE_URL
  : '';

const PROXY_PREFIX = '/api/proxy';

function getProxyUrl(path) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${PROXY_PREFIX}${path}`;
  }
  return `${PROXY_PREFIX}${path}`;
}

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
  const url = getProxyUrl(path);

  // If body is FormData, don't set 'Content-Type' manually
  // so the browser can automatically set it to 'multipart/form-data; boundary=...'
  const isFormData = options.body instanceof FormData;
  const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };

  return fetch(url, {
    headers: { ...defaultHeaders, ...getAuthHeader(), ...options.headers },
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
    return request('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ Username: studentId, Password: password }),
    });
  },
  registerStudent(payload) {
    return request('/api/Auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verifyOtp(payload) {
    return request('/api/Auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  resetPassword({ studentId, email, nationalId }) {
    return request('/api/reset-password', { method: 'POST', body: JSON.stringify({ studentId, email, nationalId }) });
  },
  getSubjects(level, term) {
    return request(`/api/Tickets/subjects?level=${level}&term=${term}`);
  },
  getDoctorsBySubject(subjectId) {
    return request(`/api/Tickets/doctors-by-subject/${encodeURIComponent(subjectId)}`);
  },
  getMyTickets(pageIndex = 1, pageSize = 10) {
    return request(`/api/Tickets/my-tickets?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  getTicketById(id) {
    return request(`/api/Tickets/${encodeURIComponent(id)}`);
  },
  getDoctorTickets(pageIndex = 1, pageSize = 10) {
    return request(`/api/Tickets/doctor-tickets?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  getDoctorStats() {
    return request('/api/Doctor/stats');
  },
  getDoctorSubjects() {
    return request('/api/Doctor/subjects');
  },
  updateTicketStatus(ticketId, status) {
    return request(`/api/Tickets/${encodeURIComponent(ticketId)}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
  },
  createTicket(payload) {
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
    return request('/api/Tickets/reply', {
      method: 'POST',
      body: JSON.stringify({ ticketId, body }),
    });
  },
  getAdminUsers(pageIndex = 1, pageSize = 10, searchTerm = '', role = null) {
    const params = new URLSearchParams({ pageIndex, pageSize });
    if (searchTerm) params.set('searchTerm', searchTerm);
    if (role) params.set('role', role);
    return request(`/api/Admin/users?${params}`);
  },
  getAdminUserById(userId) {
    return request(`/api/Admin/users/${encodeURIComponent(userId)}`);
  },
  createAdminUser(payload) {
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
    return request(`/api/Admin/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
  },

  // Bulk Upload
  bulkUploadStudents(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/Admin/students/bulk-upload', {
      method: 'POST',
      body: formData,
    });
  },
  getAdminFilteredTickets(filter) {
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
    return request(`/api/Admin/tickets/high-priority?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  markTicketHighPriority(ticketId, isHighPriority) {
    return request(`/api/Admin/tickets/${encodeURIComponent(ticketId)}/high-priority`, {
      method: 'PUT',
      body: JSON.stringify(isHighPriority),
    });
  },
  getAdminSubjects() {
    return request('/api/Admin/subjects');
  },
  createSubject(payload) {
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
    return request(`/api/Admin/doctors/${encodeURIComponent(doctorId)}/subjects`);
  },
  assignSubjectsToDoctor(doctorId, subjectIds) {
    return request('/api/Admin/doctors/assign-subjects', {
      method: 'POST',
      body: JSON.stringify({ doctorId, subjectIds: subjectIds || [] }),
    });
  },
  getStudentTickets(studentId, pageIndex = 1, pageSize = 10) {
    return request(`/api/Admin/students/${encodeURIComponent(studentId)}/tickets?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  getAdminAllTickets(pageIndex = 1, pageSize = 10) {
    return request(`/api/Tickets/all?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  getAdminAnalytics(period = null, program = null) {
    const params = new URLSearchParams();
    if (period) params.set('period', period);
    if (program) params.set('program', program);
    return request(`/api/Analytics/admin${params.toString() ? `?${params}` : ''}`);
  },
  getTopDoctors(count = 10, level = null, program = null) {
    const params = new URLSearchParams({ count });
    if (level) params.set('level', level);
    if (program) params.set('program', program);
    return request(`/api/Analytics/top-doctors?${params}`);
  },
  getTopSubjects(count = 10, level = null, program = null) {
    const params = new URLSearchParams({ count });
    if (level) params.set('level', level);
    if (program) params.set('program', program);
    return request(`/api/Analytics/top-subjects?${params}`);
  },
  getAdminMessages(pageIndex = 1, pageSize = 20) {
    return request(`/api/Admin/my-messages?pageIndex=${pageIndex}&pageSize=${pageSize}`);
  },
  adminAssignSelfToSubject(subjectId) {
    return request(`/api/Admin/subjects/${encodeURIComponent(subjectId)}/assign-self`, { method: 'POST' });
  },
  adminRemoveSelfFromSubject(subjectId) {
    return request(`/api/Admin/subjects/${encodeURIComponent(subjectId)}/unassign-self`, { method: 'DELETE' });
  },
  getAdminMySubjects() {
    return request('/api/Admin/my-subjects');
  },
  getAdminMyDoctorTickets(pageIndex = 1, pageSize = 10, status = null) {
    const params = new URLSearchParams({ pageIndex, pageSize });
    if (status !== null) params.set('status', status);
    return request(`/api/Admin/my-doctor-tickets?${params}`);
  },
  createUser(payload) {
    return this.createAdminUser(payload);
  },
  addCourse({ courseId, courseName }) {
    return Promise.reject(new Error('Add course is not supported. Use Assign Subjects to Doctor.'));
  },
  endTerm() {
    return request('/api/Admin/end-term', { method: 'POST' });
  },
  undoEndTerm() {
    return request('/api/Admin/undo-end-term', { method: 'POST' });
  },
  clearAuth() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userProgram');
      sessionStorage.removeItem('token');
    } catch (_) { }
  },
};
