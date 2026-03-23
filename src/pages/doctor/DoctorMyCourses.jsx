import { Link } from 'react-router-dom';

export default function DoctorMyCourses() {
  return (
    <>
      <h1 className="page-title">My Courses</h1>
      <div className="courses-grid">
        <Link to="/doctor/tickets?course=accounting" className="course-card">
          <span className="course-card-title">Accounting</span>
          <span className="course-card-illus" aria-hidden="true"><i className="fas fa-book"></i></span>
        </Link>
        <Link to="/doctor/tickets?course=accounting2" className="course-card">
          <span className="course-card-title">Accounting 2</span>
          <span className="course-card-illus" aria-hidden="true"><i className="fas fa-book"></i></span>
        </Link>
        <Link to="/doctor/tickets?course=accounting3" className="course-card">
          <span className="course-card-title">Accounting 3</span>
          <span className="course-card-illus" aria-hidden="true"><i className="fas fa-book"></i></span>
        </Link>
      </div>
    </>
  );
}
