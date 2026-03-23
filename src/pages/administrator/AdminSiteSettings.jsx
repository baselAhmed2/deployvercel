import { useState, useEffect } from 'react';
import { showConfirm } from '../../utils/confirmModal';
import toast from '../../utils/toast';
import { TicketAPI } from '../../api';

export default function AdminSiteSettings() {
  const [processingTerm, setProcessingTerm] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isTimerActive) {
      // Timer finished - we stay in isTimerActive but countdown is 0
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, countdown]);

  const handleEndTermInitiate = () => {
    if (isTimerActive) return;

    showConfirm({
      title: 'Initiate End Term?',
      message: 'This will start a 10-minute safety countdown. You will be able to finalize the action once the timer reaches zero. This ensures you have time to reconsider this major action.',
      confirmText: 'Start Timer (10:00)',
      cancelText: 'Cancel',
    }).then((ok) => {
      if (ok) {
        setCountdown(600); // 10 minutes
        setIsTimerActive(true);
      }
    });
  };

  const handleCancelTimer = () => {
    setIsTimerActive(false);
    setCountdown(0);
  };

  const handleEndTermFinalize = () => {
    showConfirm({
      title: 'End Term?',
      message: 'This will hide all currently existing tickets from all doctors so they start with a clean slate. Students will still see their tickets. You can undo this action if needed.',
      confirmText: 'End Term',
      cancelText: 'Cancel',
    }).then((ok) => {
      if (!ok) return;
      setProcessingTerm(true);
      if (window.TicketAPI && window.TicketAPI.endTerm) {
        window.TicketAPI.endTerm()
          .then((res) => {
            toast.success(res?.message || 'Term ended successfully. All tickets hidden from doctors.');
            setIsTimerActive(false);
            setCountdown(0);
          })
          .catch((err) => {
            toast.error(err?.message || 'Failed to end term.');
          })
          .finally(() => setProcessingTerm(false));
      } else {
        setProcessingTerm(false);
      }
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleUndoEndTerm = () => {
    showConfirm({
      title: 'Undo End Term?',
      message: 'This will restore all hidden tickets back to the doctors\' view. Are you sure?',
      confirmText: 'Undo',
      cancelText: 'Cancel',
    }).then((ok) => {
      if (!ok) return;
      setProcessingTerm(true);
      if (window.TicketAPI && window.TicketAPI.undoEndTerm) {
        window.TicketAPI.undoEndTerm()
          .then((res) => {
            toast.success(res?.message || 'End term reversed. All tickets are visible to doctors again.');
          })
          .catch((err) => {
            toast.error(err?.message || 'Failed to undo end term.');
          })
          .finally(() => setProcessingTerm(false));
      } else {
        setProcessingTerm(false);
      }
    });
  };

  return (
    <>
      <h1 className="page-title">Site Settings</h1>
      <div className="detail-card info-card" style={{ marginTop: '2rem' }}>
        <div>
          <div className="danger-card-title" style={{ color: '#0f172a' }}>
            <i className="fas fa-calendar-check" style={{ color: '#0ea5e9', marginRight: 8 }}></i>
            End Term Management
          </div>
          <p className="danger-card-note" style={{ color: '#475569', marginTop: 4 }}>
            Handling term transitions. "End Term" will hide all currently existing tickets from doctors, giving them a clean slate for the new term. It does <b>not</b> delete the tickets. You can undo this action if needed.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {!isTimerActive ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="btn-primary"
                style={{ backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                onClick={handleEndTermInitiate}
                disabled={processingTerm}
              >
                <i className="fas fa-calendar-times" style={{ marginRight: 6 }}></i> End Term (10 min timer)
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                onClick={handleUndoEndTerm}
                disabled={processingTerm}
              >
                <i className="fas fa-undo" style={{ marginRight: 6 }}></i> Undo End Term
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '3px solid #0ea5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: '#0ea5e9',
                    fontSize: '0.9rem'
                  }}>
                    {formatTime(countdown)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>End Term Safety Timer Active</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {countdown > 0
                        ? 'Waiting for safe period to end...'
                        : 'Safe period ended. You can now finalize.'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      backgroundColor: countdown > 0 ? '#cbd5e1' : '#0f172a',
                      borderColor: countdown > 0 ? '#cbd5e1' : '#0f172a',
                      cursor: countdown > 0 ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleEndTermFinalize}
                    disabled={countdown > 0 || processingTerm}
                  >
                    Confirm & Execute
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancelTimer}
                    disabled={processingTerm}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
