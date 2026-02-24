import { useState } from 'react';
import { showConfirm } from '../../utils/confirmModal';

export default function AdminSiteSettings() {
  const [deleting, setDeleting] = useState(false);
  const handleDeleteTickets = () => {
    showConfirm({
      title: 'Delete all tickets?',
      message: 'Delete all tickets data? This cannot be undone. Users will be kept.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    }).then((ok) => {
      if (!ok) return;
      setDeleting(true);
      if (window.TicketAPI && window.TicketAPI.deleteAllTickets) {
        window.TicketAPI.deleteAllTickets().finally(() => setDeleting(false));
      } else setDeleting(false);
    });
  };

  return (
    <>
      <h1 className="page-title">Site Settings</h1>
      <div className="detail-card danger-card">
        <div>
          <div className="danger-card-title"><i className="fas fa-info-circle"></i> Delete all Tickets Data</div>
          <p className="danger-card-note">Ensure: Delete Include All Data <span className="except">Except Users</span></p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="danger-card-meta">Created At 22-11-2024</span>
          <button type="button" className="btn-danger" onClick={handleDeleteTickets} disabled={deleting}>
            <i className="fas fa-trash-alt"></i> Delete Tickets
          </button>
        </div>
      </div>
    </>
  );
}
