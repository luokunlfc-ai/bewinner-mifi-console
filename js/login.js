/* Be Winner MiFi · Login & Register */
(function() {
  'use strict';

  // 如果在其他页面已登录，跳回主页
  if (MiFiUser.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // ===== Tab 切换 =====
  var tabs = document.querySelectorAll('.login-tab');
  var forms = document.querySelectorAll('.login-form');
  var codeForm = document.getElementById('formCode');
  var pwdForm = document.getElementById('formPwd');
  var regForm = document.getElementById('formReg');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      forms.forEach(function(f) { f.classList.remove('active'); });
      var target = document.getElementById('form' + capitalize(tab.dataset.form));
      if (target) target.classList.add('active');
      // 切换登录按钮
      var isCode = tab.dataset.form === 'code';
      var codeBtn = document.getElementById('codeSubmit');
      var pwdBtn = document.getElementById('pwdSubmit');
      if (codeBtn) codeBtn.style.display = isCode ? '' : 'none';
      if (pwdBtn) pwdBtn.style.display = isCode ? 'none' : '';
    });
  });

  // ===== 模式切换 =====
  var toRegLinks = document.querySelectorAll('.to-register');
  var toLoginLinks = document.querySelectorAll('.to-login');

  toRegLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      switchMode('reg');
    });
  });
  toLoginLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      switchMode('login');
    });
  });

  function switchMode(mode) {
    var isLogin = mode === 'login';
    document.getElementById('loginBlock').style.display = isLogin ? '' : 'none';
    document.getElementById('registerBlock').style.display = isLogin ? 'none' : '';
    tabs.forEach(function(t) { t.classList.remove('active'); });
    forms.forEach(function(f) { f.classList.remove('active'); });
    if (isLogin) {
      document.querySelector('.login-tab[data-form="code"]').classList.add('active');
      if (codeForm) codeForm.classList.add('active');
    } else {
      if (regForm) regForm.classList.add('active');
    }
  }

  // ===== 验证码倒计时 =====
  var counting = false;
  var countdown = 0;
  var timer = null;
  var codeBtns = document.querySelectorAll('.code-btn');

  codeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (counting) return;
      var phoneInput = btn.closest('form').querySelector('input[type="tel"], input[name="phone"]');
      var phone = phoneInput ? phoneInput.value.replace(/\s/g, '') : '';
      if (phone.length < 11) {
        showToast('请输入正确的手机号');
        return;
      }
      startCountdown(btn);
    });
  });

  function startCountdown(btn) {
    counting = true;
    countdown = 60;
    btn.classList.add('counting');
    btn.textContent = countdown + 's 后重发';
    timer = setInterval(function() {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        counting = false;
        btn.classList.remove('counting');
        btn.textContent = '发送验证码';
      } else {
        btn.textContent = countdown + 's 后重发';
      }
    }, 1000);
  }

  // ===== 密码眼睛 =====
  document.querySelectorAll('.eye-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var input = btn.parentElement.querySelector('input');
      if (!input) return;
      var isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      btn.querySelector('svg').innerHTML = isPwd
        ? '<path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.2 4.1"/><path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5-1.3"/>'
        : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
    });
  });

  // ===== 验证码登录 =====
  var codeSubmit = document.getElementById('codeSubmit');
  if (codeSubmit) {
    codeSubmit.addEventListener('click', function() {
      var phone = document.getElementById('codePhone').value.replace(/\s/g, '');
      var code = document.getElementById('codeInput').value.trim();
      if (phone.length < 11) { showToast('请输入正确的手机号'); return; }
      if (code !== '123456') { showToast('验证码错误（演示码：123456）'); return; }
      MiFiUser.login(phone);
      window.location.href = 'index.html';
    });
  }

  // ===== 密码登录 =====
  var pwdSubmit = document.getElementById('pwdSubmit');
  if (pwdSubmit) {
    pwdSubmit.addEventListener('click', function() {
      var phone = document.getElementById('pwdPhone').value.replace(/\s/g, '');
      var pwd = document.getElementById('pwdInput').value;
      if (phone.length < 11) { showToast('请输入正确的手机号'); return; }
      if (pwd.length < 6) { showToast('密码长度至少6位'); return; }
      MiFiUser.login(phone);
      window.location.href = 'index.html';
    });
  }

  // ===== 注册 =====
  var regSubmit = document.getElementById('regSubmit');
  if (regSubmit) {
    regSubmit.addEventListener('click', function() {
      var phone = document.getElementById('regPhone').value.replace(/\s/g, '');
      var code = document.getElementById('regCode').value.trim();
      var pwd = document.getElementById('regPwd').value;
      var pwd2 = document.getElementById('regPwd2').value;
      var agree = document.getElementById('regAgree');
      if (phone.length < 11) { showToast('请输入正确的手机号'); return; }
      if (code !== '123456') { showToast('验证码错误（演示码：123456）'); return; }
      if (pwd.length < 6) { showToast('密码长度至少6位'); return; }
      if (pwd !== pwd2) { showToast('两次输入的密码不一致'); return; }
      if (agree && !agree.checked) { showToast('请同意用户协议'); return; }
      MiFiUser.register(phone, pwd);
      showToast('注册成功');
      setTimeout(function() { window.location.href = 'index.html'; }, 800);
    });
  }

  // ===== 微信登录 =====
  var wechatBtn = document.getElementById('wechatBtn');
  if (wechatBtn) {
    wechatBtn.addEventListener('click', function() {
      showToast('微信授权中…');
      setTimeout(function() {
        MiFiUser.login('139****6666');
        window.location.href = 'index.html';
      }, 1000);
    });
  }

  // ===== Toast =====
  var toastEl = document.getElementById('loginToast');

  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'loginToast';
      toastEl.className = 'login-toast';
      document.body.appendChild(toastEl);
    }
    if (toastEl._timer) clearTimeout(toastEl._timer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastEl._timer = setTimeout(function() {
      toastEl.classList.remove('show');
    }, 2000);
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
})();
