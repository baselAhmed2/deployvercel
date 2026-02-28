import { useState, useEffect } from 'react';
import { TicketAPI } from '../../api';
import { showToast } from '../../utils/toast';

export default function AdminAssignToDoctor() {
    const [allSubjects, setAllSubjects] = useState([]);
    const [mySubjectIds, setMySubjectIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // subjectId being processed

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // Load all subjects + my assigned subjects in parallel
            const [allRes, myRes] = await Promise.all([
                TicketAPI.getAdminSubjects(),
                TicketAPI.getMySubjects(),
            ]);
            const subjects = Array.isArray(allRes) ? allRes : allRes?.data ?? [];
            const mine = Array.isArray(myRes) ? myRes : myRes?.data ?? [];
            setAllSubjects(subjects);
            setMySubjectIds(new Set(mine.map((s) => s.subjectId ?? s.id)));
        } catch {
            showToast('Failed to load subjects.', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleToggle(subject) {
        const id = subject.id ?? subject.subjectId;
        const isAssigned = mySubjectIds.has(id);
        setProcessing(id);
        try {
            if (isAssigned) {
                await TicketAPI.unassignSelfFromSubject(id);
                setMySubjectIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                showToast(`Removed from "${subject.name}" successfully.`);
            } else {
                await TicketAPI.assignSelfToSubject(id);
                setMySubjectIds((prev) => new Set([...prev, id]));
                showToast(`Assigned to "${subject.name}" successfully.`);
            }
        } catch (err) {
            showToast(err.message || 'Operation failed.', 'error');
        } finally {
            setProcessing(null);
        }
    }

    const mySubjects = allSubjects.filter((s) => mySubjectIds.has(s.id ?? s.subjectId));
    const otherSubjects = allSubjects.filter((s) => !mySubjectIds.has(s.id ?? s.subjectId));

    // Group subjects by program
    const groupByProgram = (list) =>
        list.reduce((acc, s) => {
            const key = s.program || 'General';
            if (!acc[key]) acc[key] = [];
            acc[key].push(s);
            return acc;
        }, {});

    const otherGroups = groupByProgram(otherSubjects);

    if (loading) {
        return (
            <>
                <h1 className="page-title">Assign to Doctor</h1>
                <p style={{ color: 'var(--text-muted, #888)', marginTop: '2rem', textAlign: 'center' }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />
                    Loading subjects…
                </p>
            </>
        );
    }

    return (
        <>
            <h1 className="page-title">Assign to Doctor</h1>
            <p className="section-desc" style={{ marginBottom: '1.5rem' }}>
                Select the subjects you teach. Tickets for these subjects will appear in your{' '}
                <strong>My Tickets</strong> section on the Dashboard.
            </p>

            {/* ── My Current Assignments ── */}
            <section className="form-section" style={{ marginBottom: '1.5rem' }}>
                <h2 className="section-title">
                    <i className="fas fa-chalkboard-teacher" style={{ marginRight: 8, color: '#6f42c1' }} />
                    My Assigned Subjects
                    {mySubjects.length > 0 && (
                        <span
                            style={{
                                marginLeft: 10,
                                fontSize: '0.8rem',
                                background: '#6f42c1',
                                color: '#fff',
                                borderRadius: 12,
                                padding: '2px 10px',
                            }}
                        >
                            {mySubjects.length}
                        </span>
                    )}
                </h2>
                {mySubjects.length === 0 ? (
                    <p style={{ color: 'var(--text-muted, #888)', margin: '0.5rem 0 0' }}>
                        You are not assigned to any subject yet. Join subjects below.
                    </p>
                ) : (
                    <div className="user-list" style={{ gap: '0.75rem' }}>
                        {mySubjects.map((subject) => {
                            const id = subject.id ?? subject.subjectId;
                            const busy = processing === id;
                            return (
                                <div key={id} className="user-card" style={{ alignItems: 'center' }}>
                                    <div className="user-card-info">
                                        <div className="user-card-name" style={{ fontWeight: 600 }}>
                                            <i className="fas fa-book" style={{ marginRight: 8, color: '#6f42c1' }} />
                                            {subject.name}
                                        </div>
                                        <div className="user-card-ssn" style={{ marginTop: 2 }}>
                                            Level {subject.level} · Term {subject.term} · {subject.program}
                                        </div>
                                    </div>
                                    <div className="user-card-actions">
                                        <button
                                            type="button"
                                            className="btn-danger"
                                            onClick={() => handleToggle(subject)}
                                            disabled={busy}
                                        >
                                            {busy ? (
                                                <i className="fas fa-spinner fa-spin" />
                                            ) : (
                                                <i className="fas fa-minus-circle" />
                                            )}{' '}
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Available Subjects ── */}
            <section className="form-section">
                <h2 className="section-title">
                    <i className="fas fa-list" style={{ marginRight: 8 }} />
                    Available Subjects
                </h2>
                {otherSubjects.length === 0 ? (
                    <p style={{ color: 'var(--text-muted, #888)', margin: '0.5rem 0 0' }}>
                        You are assigned to all available subjects.
                    </p>
                ) : (
                    Object.entries(otherGroups).map(([program, subjects]) => (
                        <div key={program} style={{ marginBottom: '1.25rem' }}>
                            <div
                                style={{
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'var(--text-muted, #888)',
                                    marginBottom: '0.6rem',
                                }}
                            >
                                {program}
                            </div>
                            <div className="user-list" style={{ gap: '0.75rem' }}>
                                {subjects.map((subject) => {
                                    const id = subject.id ?? subject.subjectId;
                                    const busy = processing === id;
                                    return (
                                        <div key={id} className="user-card" style={{ alignItems: 'center' }}>
                                            <div className="user-card-info">
                                                <div className="user-card-name" style={{ fontWeight: 600 }}>
                                                    <i className="fas fa-book-open" style={{ marginRight: 8, color: '#888' }} />
                                                    {subject.name}
                                                </div>
                                                <div className="user-card-ssn" style={{ marginTop: 2 }}>
                                                    Level {subject.level} · Term {subject.term} · {subject.program}
                                                </div>
                                            </div>
                                            <div className="user-card-actions">
                                                <button
                                                    type="button"
                                                    className="btn-primary"
                                                    onClick={() => handleToggle(subject)}
                                                    disabled={busy}
                                                >
                                                    {busy ? (
                                                        <i className="fas fa-spinner fa-spin" />
                                                    ) : (
                                                        <i className="fas fa-plus-circle" />
                                                    )}{' '}
                                                    Join
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </section>
        </>
    );
}
