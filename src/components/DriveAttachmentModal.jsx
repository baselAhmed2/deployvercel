'use client';

import { useState } from 'react';

export default function DriveAttachmentModal({ isOpen, onClose, onAttach }) {
  const [driveLink, setDriveLink] = useState('');

  if (!isOpen) return null;

  const handleAttach = (e) => {
    e.preventDefault();
    if (!driveLink.trim()) return;
    onAttach(driveLink.trim());
    setDriveLink('');
    onClose();
  };

  return (
    <div className="modal-overlay modal-overlay--visible">
      <div className="modal-box" style={{ maxWidth: '500px', textAlign: 'right', direction: 'rtl' }}>
        <h3 className="modal-title" style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#6f42c1', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-cloud-upload-alt"></i> إرفاق ملفات
        </h3>
        
        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #6f42c1', borderRight: 'none' }}>
          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#495057' }}>
            🎉 <strong>مرحباً بك!</strong> لضمان حرية رفع البيانات لك بدون قيود في المساحة، نطلب منك رفع ملفاتك على <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" style={{color: '#0d6efd', fontWeight: 'bold', textDecoration: 'underline'}}>Google Drive</a> أو أي منصة مشابهة والتأكد من أن الفولدر <strong>Public</strong> (متاح للجميع)، ثم ضع الرابط هنا.
          </p>
        </div>

        <form onSubmit={handleAttach}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>رابط الملفات (Google Drive Link)</label>
            <input 
              type="url" 
              className="search-input" 
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #dee2e6', borderRadius: '8px', fontFamily: 'inherit' }}
              placeholder="https://drive.google.com/..." 
              value={driveLink} 
              onChange={(e) => setDriveLink(e.target.value)} 
              required
              autoFocus
            />
          </div>

          <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '24px', lineHeight: '1.6', borderTop: '1px solid #e9ecef', paddingTop: '16px' }}>
            <strong style={{ display: 'block', marginBottom: '8px', color: '#212529' }}>📌 طريقة رفع الملفات كالتالي:</strong>
            <ul style={{ paddingRight: '20px', margin: 0 }}>
              <li>قم بالدخول إلى حسابك في Google Drive.</li>
              <li>اضغط على <strong>جديد (New)</strong> ثم اختر رفع مجلد أو ملف.</li>
              <li>بعد انتهاء الرفع، اضغط بزر الماوس الأيمن على المجلد واختر <strong>مشاركة (Share)</strong>.</li>
              <li>تحت قسم "صلاحية الوصول العامة"، قم بتغييرها من "مقيّد" إلى <strong>"أي شخص لديه الرابط"</strong> (Anyone with the link).</li>
              <li>اضغط على <strong>نسخ الرابط (Copy link)</strong> وضعه في الخانة بالأعلى.</li>
            </ul>
          </div>

          <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
            <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose}>إلغاء</button>
            <button type="submit" className="modal-btn modal-btn--confirm" style={{ background: '#6f42c1' }}>إدراج الرابط</button>
          </div>
        </form>
      </div>
    </div>
  );
}
