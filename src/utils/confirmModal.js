function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show a centered confirm modal. Returns a Promise<boolean>: true = confirm, false = cancel.
 * @param {Object} options
 * @param {string} [options.title='Confirm']
 * @param {string} options.message
 * @param {string} [options.confirmText='Confirm']
 * @param {string} [options.cancelText='Cancel']
 * @param {string} [options.confirmClass='btn-danger'] - e.g. 'btn-danger' or 'btn-primary'
 */
export function showConfirm(options = {}) {
  const {
    title = 'Confirm',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmClass = 'btn-danger',
  } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-title');

    const box = document.createElement('div');
    box.className = 'modal-box';
    box.innerHTML = `
      <h2 id="modal-title" class="modal-title">${escapeHtml(title)}</h2>
      <p class="modal-message">${escapeHtml(message)}</p>
      <div class="modal-actions">
        <button type="button" class="modal-btn modal-btn--cancel">${escapeHtml(cancelText)}</button>
        <button type="button" class="modal-btn ${escapeHtml(confirmClass)} modal-btn--confirm">${escapeHtml(confirmText)}</button>
      </div>
    `;

    function close(result) {
      overlay.classList.remove('modal-overlay--visible');
      overlay.addEventListener('transitionend', () => {
        overlay.remove();
        resolve(result);
      }, { once: true });
    }

    box.querySelector('.modal-btn--cancel').addEventListener('click', () => close(false));
    box.querySelector('.modal-btn--confirm').addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') box.querySelector('.modal-btn--confirm').click();
    });

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('modal-overlay--visible'));
    box.querySelector('.modal-btn--cancel').focus();
  });
}

/**
 * Show a centered alert modal (OK only). Returns a Promise that resolves when user clicks OK.
 */
export function showAlert(message, title = 'Notice') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');

    const box = document.createElement('div');
    box.className = 'modal-box';
    box.innerHTML = `
      <h2 class="modal-title">${escapeHtml(title)}</h2>
      <p class="modal-message">${escapeHtml(message)}</p>
      <div class="modal-actions">
        <button type="button" class="modal-btn btn-primary modal-btn--ok">OK</button>
      </div>
    `;

    function close() {
      overlay.classList.remove('modal-overlay--visible');
      overlay.addEventListener('transitionend', () => {
        overlay.remove();
        resolve();
      }, { once: true });
    }

    box.querySelector('.modal-btn--ok').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'Enter') close(); });

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('modal-overlay--visible'));
    box.querySelector('.modal-btn--ok').focus();
  });
}
