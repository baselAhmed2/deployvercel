'use client';

import { TicketAPI as LibAPI } from '../../../lib/api';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const STATUS_COLORS = {
    open: { bg: '#fff3cd', text: '#856404', label: 'Open' },
    pending: { bg: '#cfe2ff', text: '#084298', label: 'Pending' },
    resolved: { bg: '#d1e7dd', text: '#0a3622', label: 'Resolved' },
    closed: { bg: '#e2e3e5', text: '#41464b', label: 'Closed' },
    rejected: { bg: '#f8d7da', text: '#842029', label: 'Rejected' },
};

function statusStyle(status) {
    const s = (status ?? '').toLowerCase();
    return STATUS_COLORS[s] ?? { bg: '#e2e3e5', text: '#41464b', label: status || '—' };
}

function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function StudentTicketsContent() {
    const searchParams = useSearchParams();
    const pageParam = parseInt(searchParams.get('page') || '1', 10);

    const [studentId, setStudentId] = useState('');
    const [submittedId, setSubmittedId] = useState('');
    const [tickets, setTickets] = useState([]);
    const [totalCount, setTotalCount] = useState(null);
    const [pagination, setPagination] = useState({ totalPages: 1 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [errorInput, setErrorInput] = useState(false);
    const PAGE_SIZE = 10;

    const fetchTickets = useCallback((id, page) => {
        if (!id.trim()) return;
        const api = (typeof window !== 'undefined' && window.TicketAPI && window.TicketAPI.getStudentTickets)
            ? window.TicketAPI
            : LibAPI;
        setLoading(true);
        setError('');
        setSearched(true);

        Promise.all([
            api.getStudentTickets(id.trim(), page, PAGE_SIZE),
            page === 1 ? api.getStudentTicketCount(id.trim()) : Promise.resolve(null),
        ])
            .then(([ticketsRes, countRes]) => {
                const data = ticketsRes?.data ?? ticketsRes?.Data ?? (Array.isArray(ticketsRes) ? ticketsRes : []);
                const tp = ticketsRes?.totalPages ?? ticketsRes?.TotalPages
                    ?? Math.max(1, Math.ceil((ticketsRes?.totalCount ?? ticketsRes?.TotalCount ?? 0) / PAGE_SIZE));
                setTickets(data);
                setPagination({ totalPages: tp });
                if (countRes !== null) {
                    const cnt = countRes?.count ?? countRes?.Count ?? countRes?.totalCount ?? countRes?.TotalCount ?? countRes;
                    setTotalCount(typeof cnt === 'number' ? cnt : null);
                }
            })
            .catch((err) => {
                setError((err && err.message) ? err.message : 'Failed to load tickets.');
                setTickets([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!studentId.trim()) {
            setErrorInput(true);
            return;
        }
        setErrorInput(false);
        setSubmittedId(studentId.trim());
        fetchTickets(studentId.trim(), 1);
    };

    // Refetch when page changes (and we already have a submitted ID)
    useEffect(() => {
        if (submittedId && pageParam > 1) {
            fetchTickets(submittedId, pageParam);
        }
    }, [pageParam, submittedId, fetchTickets]);

    const pageHref = (p) => {
        const params = new URLSearchParams();
        if (p > 1) params.set('page', String(p));
        return `/administrator/student-tickets${params.toString() ? `?${params}` : ''}`;
    };

    return (
        <>
            {/* Header */}
            <div className="toolbar-row" style={{ marginBottom: 20 }}>
                <h1 className="page-title" style={{ margin: 0 }}>Student Tickets</h1>
                <Link href="/administrator" className="btn-primary">
                    <i className="fas fa-arrow-left" /> Back
                </Link>
            </div>

            {/* Search Card */}
            <div className="detail-card" style={{ marginBottom: 20 }}>
                <h2 className="section-title">
                    <i className="fas fa-search" style={{ color: '#6f42c1', marginRight: 8 }} />
                    Search Student Tickets
                </h2>
                <p className="section-desc">Enter a Student ID to view their tickets and total ticket count.</p>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                    <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                        <i className="fas fa-id-card" style={{
                            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                            color: '#aaa', pointerEvents: 'none'
                        }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter Student ID..."
                            value={studentId}
                            autoComplete="off"
                            onChange={(e) => { setStudentId(e.target.value); setErrorInput(false); }}
                            style={{
                                paddingLeft: 36,
                                borderColor: errorInput ? '#ef4444' : undefined,
                                boxShadow: errorInput ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : undefined,
                            }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        <i className="fas fa-search" /> Search
                    </button>
                </form>
                {errorInput && (
                    <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 6 }}>
                        Please enter a Student ID first.
                    </p>
                )}
            </div>

            {/* Summary badge */}
            {searched && !loading && !error && totalCount !== null && (
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: 'linear-gradient(135deg, #6f42c1, #818cf8)',
                    color: '#fff', borderRadius: 12, padding: '10px 20px',
                    marginBottom: 16, fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(111, 66, 193, 0.25)',
                }}>
                    <i className="fas fa-ticket-alt" />
                    Student <strong>{submittedId}</strong> — Total Tickets: <strong>{totalCount}</strong>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <p style={{ textAlign: 'center', padding: 32 }}>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} />Loading...
                </p>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    padding: '14px 18px', borderRadius: 10,
                    background: '#fef2f2', border: '1px solid #fecaca',
                    color: '#dc2626', marginBottom: 16,
                }}>
                    <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />{error}
                </div>
            )}

            {/* Empty state */}
            {searched && !loading && !error && tickets.length === 0 && (
                <div style={{
                    textAlign: 'center', padding: '48px 24px',
                    background: '#f9fafb', borderRadius: 12, border: '1px dashed #d1d5db',
                }}>
                    <i className="fas fa-inbox" style={{ fontSize: '2rem', color: '#9ca3af', marginBottom: 12 }} />
                    <p style={{ color: '#6b7280', margin: 0 }}>No tickets found for this student.</p>
                </div>
            )}

            {/* Ticket List */}
            {!loading && !error && tickets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {tickets.map((ticket) => {
                        const id = ticket.id ?? ticket.Id ?? ticket.ticketId ?? ticket.TicketId ?? '—';
                        const title = ticket.title ?? ticket.Title ?? '—';
                        const status = ticket.status ?? ticket.Status ?? '';
                        const subject = ticket.subjectName ?? ticket.SubjectName ?? ticket.subject ?? ticket.Subject ?? '—';
                        const doctor = ticket.doctorName ?? ticket.DoctorName ?? ticket.doctor ?? ticket.Doctor ?? '—';
                        const createdAt = ticket.createdAt ?? ticket.CreatedAt ?? ticket.date ?? ticket.Date ?? '';
                        const priority = ticket.isHighPriority ?? ticket.IsHighPriority ?? false;
                        const ss = statusStyle(status);
                        return (
                            <div key={id} className="detail-card" style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6f42c1' }}>#{id}</span>
                                            {priority && (
                                                <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#dc2626', borderRadius: 6, padding: '1px 7px', fontWeight: 600 }}>
                                                    <i className="fas fa-exclamation-triangle" style={{ marginRight: 4 }} />High Priority
                                                </span>
                                            )}
                                            <span style={{
                                                fontSize: '0.75rem', borderRadius: 6, padding: '2px 8px', fontWeight: 600,
                                                background: ss.bg, color: ss.text,
                                            }}>
                                                {ss.label}
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4, wordBreak: 'break-word' }}>{title}</div>
                                        <div style={{ fontSize: '0.82rem', color: '#6b7280', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                            <span><i className="fas fa-book" style={{ marginRight: 4 }} />{subject}</span>
                                            <span><i className="fas fa-user-md" style={{ marginRight: 4 }} />{doctor}</span>
                                            {createdAt && (
                                                <span>
                                                    <i className="fas fa-calendar-alt" style={{ marginRight: 4 }} />
                                                    {new Date(createdAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/administrator/tickets/${encodeURIComponent(id)}`}
                                        className="btn-primary btn-sm"
                                        style={{ flexShrink: 0 }}
                                    >
                                        <i className="fas fa-eye" /> View
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
                <nav className="pagination" aria-label="Tickets pagination" style={{ marginTop: 20 }}>
                    <Link href={pageHref(Math.max(1, pageParam - 1))}>
                        <button type="button" disabled={pageParam <= 1}>Previous</button>
                    </Link>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <Link key={p} href={pageHref(p)} className={p === pageParam ? 'active' : ''}>
                            {p}
                        </Link>
                    ))}
                    <Link href={pageHref(Math.min(pagination.totalPages, pageParam + 1))}>
                        <button type="button" disabled={pageParam >= pagination.totalPages}>Next</button>
                    </Link>
                </nav>
            )}

        </>
    );
}

export default function AdminStudentTickets() {
    return (
        <Suspense fallback={<div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fas fa-spinner fa-spin" /></div>}>
            <StudentTicketsContent />
        </Suspense>
    );
}
