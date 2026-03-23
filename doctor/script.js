(function () {
  'use strict';

  var sidebar = document.getElementById('sidebar');
  var sidebarToggle = document.querySelector('.sidebar-toggle');
  var sidebarClose = document.querySelector('.sidebar-close');
  var overlay = document.querySelector('.sidebar-overlay');

  function openSidebar() {
    if (sidebar) sidebar.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebar) sidebar.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Status dropdown (with red / orange / green dots)
  var statusDropdown = document.getElementById('status-dropdown');
  if (statusDropdown) {
    var trigger = statusDropdown.querySelector('.status-dropdown-trigger');
    var hiddenInput = statusDropdown.querySelector('input[name="status"]');
    var labelEl = statusDropdown.querySelector('.status-dropdown-label');
    var triggerDot = statusDropdown.querySelector('.status-dropdown-trigger .status-dot');
    var options = statusDropdown.querySelectorAll('.status-dropdown-option');

    function closeStatusDropdown() {
      statusDropdown.setAttribute('aria-expanded', 'false');
    }

    function selectOption(option) {
      var value = option.getAttribute('data-value');
      var dot = option.getAttribute('data-dot');
      var text = option.textContent.trim();
      if (hiddenInput) hiddenInput.value = value;
      if (labelEl) labelEl.textContent = text;
      if (triggerDot) {
        triggerDot.className = 'status-dot status-dot--' + dot;
      }
      options.forEach(function (opt) {
        opt.classList.toggle('selected', opt === option);
      });
      closeStatusDropdown();
    }

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var open = statusDropdown.getAttribute('aria-expanded') === 'true';
        statusDropdown.setAttribute('aria-expanded', !open);
      });
    }

    options.forEach(function (option) {
      option.addEventListener('click', function (e) {
        e.preventDefault();
        selectOption(option);
      });
    });

    document.addEventListener('click', function () {
      closeStatusDropdown();
    });

    statusDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  // Collapsible sections (ticket detail)
  document.querySelectorAll('.collapsible-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      var targetId = this.getAttribute('aria-controls');
      if (targetId) {
        var target = document.getElementById(targetId);
        if (target) target.hidden = expanded;
      }
    });
  });

  // Toast notification
  function showToast(message, type) {
    type = type || 'success';
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    var icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
    toast.innerHTML = '<span class="toast-icon"><i class="fas ' + icon + '"></i></span><span class="toast-message">' + escapeHtml(message) + '</span>';
    function escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    container.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('toast--visible');
    });
    setTimeout(function () {
      toast.classList.remove('toast--visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  }

  // Reply form submit
  var replyForm = document.getElementById('reply-form');
  if (replyForm) {
    replyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var form = e.target;
      var ticketId = (typeof ticketIdFromPage !== 'undefined' && ticketIdFromPage) ? ticketIdFromPage : (new URLSearchParams(window.location.search).get('id'));
      var body = (form.body && form.body.value) || (form.querySelector('[name="body"]') && form.querySelector('[name="body"]').value);
      if (typeof TicketAPI !== 'undefined' && TicketAPI.replyToTicket && ticketId) {
        var btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        TicketAPI.replyToTicket(ticketId, {
          body: body,
          subject: form.subject && form.subject.value,
          status: form.status && form.status.value
        })
          .then(function () {
            showToast('Reply submitted successfully.');
            if (btn) btn.disabled = false;
          })
          .catch(function (err) {
            if (btn) btn.disabled = false;
            showToast((err && err.message) ? err.message : 'Failed to submit reply.', 'error');
          });
      } else {
        showToast('Reply submitted successfully.');
      }
    });
  }

  // Logout
  document.querySelectorAll('a[href*="login/index.html"]').forEach(function (a) {
    if (a.getAttribute('href').indexOf('login') === -1) return;
    a.addEventListener('click', function () {
      if (typeof TicketAPI !== 'undefined') TicketAPI.clearAuth();
    });
  });
})();
