import { useState } from 'react';

export default function AdminAddCourse() {
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (window.TicketAPI && window.TicketAPI.addCourse) {
      window.TicketAPI.addCourse({ courseId, courseName }).catch(() => {});
    }
  };

  return (
    <>
      <h1 className="page-title">Add Course</h1>
      <section className="form-section">
        <h2 className="section-title">Create Course</h2>
        <p className="section-desc">Add a new course to the system</p>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Course ID <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="e.g. CS 122" value={courseId} onChange={(e) => setCourseId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Course Name <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="Enter course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </section>
    </>
  );
}
