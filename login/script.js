(function () {
  'use strict';

  var form = document.querySelector('.login-form');
  var studentIdInput = document.getElementById('studentId');
  var passwordInput = document.getElementById('password');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var studentId = studentIdInput ? studentIdInput.value.trim() : '';
    var password = passwordInput ? passwordInput.value : '';

    if (!studentId || !password) {
      showError('Please enter Student ID and Password.');
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Signing in...';
    }

    TicketAPI.login(studentId, password)
      .then(function () {
        window.location.href = '../Student/index.html';
      })
      .catch(function (err) {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Sign In <i class="fas fa-arrow-right"></i>';
        }
        var msg = (err && err.message) ? err.message : 'Login failed. Check your ID and password.';
        if (err && err.status === 401) msg = 'Invalid Student ID or Password.';
        showError(msg);
      });
  });

  function showError(message) {
    var existing = document.querySelector('.login-error');
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.className = 'login-error';
    div.setAttribute('role', 'alert');
    div.style.cssText = 'color: #dc3545; font-size: 0.9rem; margin-top: 12px; text-align: center;';
    div.textContent = message;
    form.appendChild(div);
    setTimeout(function () { div.remove(); }, 5000);
  }
})();
