/* Be Winner MiFi · Home Interactions  v0.3 */

(function () {
  // === 速率数字滚动 ===
  const downEl = document.getElementById('downNum');
  const upEl   = document.getElementById('upNum');
  if (downEl && upEl) {
    setInterval(() => {
      downEl.textContent = (80 + Math.random() * 80).toFixed(1);
      upEl.textContent   = (25 + Math.random() * 30).toFixed(1);
    }, 1500);
  }

  // === Tabbar 高亮 ===
  document.querySelectorAll('.tabbar .tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tabbar .tab').forEach(x => x.classList.remove('active'));
      if (!t.classList.contains('center')) t.classList.add('active');
    });
  });

  // === 通用遮罩控制 ===
  const mask = document.getElementById('sheetMask');
  let activeSheet = null;

  function openSheet(sheetEl) {
    if (activeSheet) activeSheet.classList.remove('show');
    sheetEl.classList.add('show');
    mask.classList.add('show');
    activeSheet = sheetEl;
  }
  function closeSheet() {
    if (activeSheet) activeSheet.classList.remove('show');
    mask.classList.remove('show');
    activeSheet = null;
  }
  if (mask) mask.addEventListener('click', closeSheet);

  // === 设备切换抽屉 ===
  const devSheet = document.getElementById('devSheet');
  const btnDev   = document.getElementById('btnSwitchDev');
  if (btnDev && devSheet) btnDev.addEventListener('click', () => openSheet(devSheet));

  document.querySelectorAll('.di-switch').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSheet();
    });
  });

  const bindBtn = document.querySelector('.bind-btn');
  if (bindBtn) bindBtn.addEventListener('click', () => {
    bindBtn.innerHTML = '<span class="plus">✓</span> 进入扫码绑定…';
    setTimeout(closeSheet, 700);
    setTimeout(() => {
      bindBtn.innerHTML = '<span class="plus">+</span> 绑定新设备';
    }, 1200);
  });

  // === WiFi 密码切换（主页卡片） ===
  const eye  = document.getElementById('eyeBtn');
  const pwd  = document.getElementById('pwdText');
  let shown = false;
  if (eye && pwd) {
    const real   = pwd.dataset.pwd || '';
    const masked = '•'.repeat(Math.max(real.length, 8));
    pwd.textContent = masked;
    eye.addEventListener('click', () => {
      shown = !shown;
      pwd.textContent = shown ? real : masked;
      eye.querySelector('svg').innerHTML = shown
        ? '<path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.2 4.1"/><path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5-1.3"/>'
        : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
    });
  }

  // === 实名激活按钮 ===
  const realnameBtn = document.getElementById('btnRealname');
  if (realnameBtn) {
    realnameBtn.addEventListener('click', () => {
      window.open('https://eca.189.cn/', '_blank');
    });
  }

  // === WiFi 设置抽屉 ===
  const wifiSheet = document.getElementById('wifiSheet');
  const btnWifi   = document.getElementById('btnWifiSet');
  const wifiClose = document.getElementById('wifiSheetClose');
  if (btnWifi && wifiSheet) btnWifi.addEventListener('click', () => openSheet(wifiSheet));
  if (wifiClose) wifiClose.addEventListener('click', closeSheet);

  // WiFi 设置表单内密码切换
  const formEye = document.getElementById('formEyeBtn');
  const formPwd = document.getElementById('wifiPwdInput');
  if (formEye && formPwd) {
    formEye.addEventListener('click', () => {
      const isPassword = formPwd.type === 'password';
      formPwd.type = isPassword ? 'text' : 'password';
      formEye.querySelector('svg').innerHTML = isPassword
        ? '<path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.2 4.1"/><path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5-1.3"/>'
        : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
    });
  }

  // 频段切换
  document.querySelectorAll('.form-seg').forEach(seg => {
    seg.querySelectorAll('span').forEach(s => {
      s.addEventListener('click', () => {
        seg.querySelectorAll('span').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
      });
    });
  });

  // Toggle 开关
  document.querySelectorAll('.toggle').forEach(tog => {
    tog.addEventListener('click', () => tog.classList.toggle('on'));
  });

  // 保存按钮
  const saveBtn = document.querySelector('.save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const orig = saveBtn.textContent;
      saveBtn.textContent = '已保存 ✓';
      saveBtn.style.background = '#22c55e';
      setTimeout(() => {
        saveBtn.textContent = orig;
        saveBtn.style.background = '';
        closeSheet();
      }, 800);
    });
  }
})();
