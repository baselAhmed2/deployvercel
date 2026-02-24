(function () {
  'use strict';

  var form = document.getElementById('reset-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var studentId = (form.studentId && form.studentId.value) ? form.studentId.value.trim() : '';
    var email = (form.email && form.email.value) ? form.email.value.trim() : '';
    var nationalId = (form.nationalId && form.nationalId.value) ? form.nationalId.value.trim() : '';

    if (!studentId || !email || !nationalId) {
      showMessage('Please fill in Student ID, Email and National ID.', 'error');
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
    }

    var payload = { studentId: studentId, email: email, nationalId: nationalId };

    if (typeof TicketAPI !== 'undefined' && TicketAPI.resetPassword) {
      TicketAPI.resetPassword(payload)
        .then(function () {
          showMessage('Password reset link has been sent to your email.', 'success');
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Reset Password <i class="fas fa-key"></i>';
          }
        })
        .catch(function (err) {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Reset Password <i class="fas fa-key"></i>';
          }
          var msg = (err && err.message) ? err.message : 'Failed to reset password. Check your data and try again.';
          showMessage(msg, 'error');
        });
    } else {
      showMessage('Password reset request received. Check your email for instructions.', 'success');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Reset Password <i class="fas fa-key"></i>';
      }
    }
  });

  function showMessage(message, type) {
    var existing = document.querySelector('.reset-message');
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.className = 'reset-message';
    div.setAttribute('role', 'alert');
    var isError = type === 'error';
    div.style.cssText = 'color: ' + (isError ? '#dc3545' : '#198754') + '; font-size: 0.9rem; margin-top: 12px; text-align: center;';
    div.textContent = message;
    form.appendChild(div);
    setTimeout(function () { if (div.parentNode) div.remove(); }, 6000);
  }
})();
