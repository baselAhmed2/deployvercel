import React, { useState, useRef } from 'react';
import { showToast } from '../utils/toast';

export default function BulkUploadModal({ isOpen, onClose }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            showToast('Please select a file first.', 'error');
            return;
        }

        // Validate type roughly
        if (!file.name.match(/\.(csv)$/i)) {
            showToast('Please upload a valid CSV file (.csv)', 'error');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            if (typeof window.TicketAPI !== 'undefined' && window.TicketAPI.bulkUploadStudents) {
                const response = await window.TicketAPI.bulkUploadStudents(file);

                // Ensure the response isn't just an error string or an error object
                if (response && (response.errors || response.Errors || response.added !== undefined || response.Added !== undefined)) {
                    setResult(response);
                    showToast('File processed successfully!');
                } else {
                    showToast(response?.message || 'Invalid response from server.', 'error');
                }
            } else {
                showToast('Bulk Upload API is not available.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast(err.message || 'Upload failed', 'error');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
        }}>
            <div style={{
                background: '#fff',
                padding: '24px',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '650px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                position: 'relative'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem', color: '#333' }}>Bulk Upload Students</h2>

                {!result ? (
                    <div>
                        <p style={{ color: '#555', marginBottom: 16 }}>
                            Upload a CSV file (<code>.csv</code>) to add or update students in bulk.<br />
                            <strong>Format required:</strong> Row 1 must be headers.
                            <br />Column 1: <strong>ID</strong> | Column 2: <strong>SSN</strong> | Column 3: <strong>Name</strong> (Comma separated)
                        </p>

                        <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#e9ecef', borderRadius: '4px', borderLeft: '4px solid #0d6efd' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>
                                <strong>Need a template?</strong> Download the exact CSV format required:
                            </p>
                            <a
                                href="https://drive.google.com/file/d/11u_Z0RQ47noBF-Z7asg329IvRi64759u/view?usp=sharing"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-block', marginTop: '8px', color: '#0d6efd', textDecoration: 'none', fontWeight: 'bold' }}
                            >
                                <i className="fas fa-download" style={{ marginRight: 6 }}></i> Download Template
                            </a>
                        </div>

                        <div style={{ padding: '20px', border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center', marginBottom: 16 }}>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                id="excel-upload"
                            />
                            <label htmlFor="excel-upload" className="btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                <i className="fas fa-file-csv" style={{ marginRight: 8 }}></i> Choose CSV File
                            </label>
                            <div style={{ marginTop: 12, fontWeight: 500, color: file ? '#28a745' : '#888' }}>
                                {file ? file.name : 'No file chosen'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button type="button" className="btn-secondary" onClick={handleClose} disabled={loading}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={handleUpload}
                                disabled={loading || !file}
                                style={{ minWidth: 120 }}
                            >
                                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Upload & Process'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ padding: 16, background: '#f8f9fa', borderRadius: 8, marginBottom: 16 }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: '#333' }}>Upload Report</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <div style={{ padding: 12, background: '#fff', borderLeft: '4px solid #0d6efd', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Total Rows</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>{result.totalRows || result.TotalRows || 0}</div>
                                </div>
                                <div style={{ padding: 12, background: '#fff', borderLeft: '4px solid #28a745', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Added New</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>{result.added || result.Added || 0}</div>
                                </div>
                                <div style={{ padding: 12, background: '#fff', borderLeft: '4px solid #17a2b8', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Updated</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>{result.updated || result.Updated || 0}</div>
                                </div>
                                <div style={{ padding: 12, background: '#fff', borderLeft: '4px solid #ffc107', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Skipped (Errors)</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>{result.skipped || result.Skipped || 0}</div>
                                </div>
                            </div>

                            {((result.errors && result.errors.length > 0) || (result.Errors && result.Errors.length > 0)) && (
                                <div style={{ marginTop: 16 }}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#dc3545', fontSize: '1rem' }}>Errors ({result.errors?.length || result.Errors?.length})</h4>
                                    <div style={{ maxHeight: 150, overflowY: 'auto', background: '#ffeeba', padding: 8, borderRadius: 4, border: '1px solid #ffdf7e', fontSize: '0.85rem' }}>
                                        <ul style={{ margin: 0, paddingLeft: 20, color: '#856404' }}>
                                            {(result.errors || result.Errors).map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button type="button" className="btn-primary" onClick={handleClose}>
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
