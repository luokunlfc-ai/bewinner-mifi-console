/* Be Winner MiFi · WiFi 管理页交互 */

(function () {
  // === 通用遮罩 & 抽屉控制 ===
  const mask = document.getElementById('sheetMask');
  let activeSheet = null;

  function openSheet(el) {
    if (activeSheet) activeSheet.classList.remove('show');
    el.classList.add('show');
    mask.classList.add('show');
    activeSheet = el;
  }
  function closeSheet() {
    if (activeSheet) activeSheet.classList.remove('show');
    mask.classList.remove('show');
    activeSheet = null;
  }
  if (mask) mask.addEventListener('click', closeSheet);

  // === WiFi 密码切换（信息卡） ===
  const eye = document.getElementById('wfEyeBtn');
  const pwd = document.getElementById('wfPwdText');
  let shown = false;
  if (eye && pwd) {
    const real = pwd.dataset.pwd || '';
    const masked = '•'.repeat(Math.max(real.length, 8));
    pwd.textContent = masked;
    eye.addEventListener('click', (e) => {
      e.stopPropagation();
      shown = !shown;
      pwd.textContent = shown ? real : masked;
      eye.querySelector('svg').innerHTML = shown
        ? '<path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.2 4.1"/><path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5-1.3"/>'
        : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
    });
  }

  // === WiFi 设置抽屉 ===
  const wifiSheet = document.getElementById('wifiSheet');
  const btnSet = document.getElementById('btnWifiSetting');
  const wifiClose = document.getElementById('wifiSheetClose');
  if (btnSet && wifiSheet) btnSet.addEventListener('click', () => openSheet(wifiSheet));
  if (wifiClose) wifiClose.addEventListener('click', closeSheet);

  // 表单内密码切换
  const formEye = document.getElementById('formEyeBtn');
  const formPwd = document.getElementById('wifiPwdInput');
  if (formEye && formPwd) {
    formEye.addEventListener('click', () => {
      const isP = formPwd.type === 'password';
      formPwd.type = isP ? 'text' : 'password';
      formEye.querySelector('svg').innerHTML = isP
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
  document.querySelectorAll('.toggle').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('on'));
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

  // === 设备详情抽屉 ===
  const ddSheet = document.getElementById('devDetailSheet');
  const ddClose = document.getElementById('ddClose');
  const ddName  = document.getElementById('ddName');
  const ddType  = document.getElementById('ddType');
  const ddIp    = document.getElementById('ddIp');
  const ddMac   = document.getElementById('ddMac');
  const ddDur   = document.getElementById('ddDur');
  const ddRssi  = document.getElementById('ddRssi');
  const ddTraffic = document.getElementById('ddTraffic');
  const ddKick  = document.getElementById('ddKick');

  var mockData = {
    'iPhone 15 Pro':   { type: '智能手机', ip: '192.168.0.101', mac: 'A4:CF:12:8B:3D:E7', dur: '2h 15m', rssi: '-42 dBm (优秀)',  traffic: '1.28 GB' },
    'MacBook Pro':     { type: '笔记本电脑', ip: '192.168.0.102', mac: 'F8:4D:89:2A:CC:41', dur: '4h 03m', rssi: '-51 dBm (良好)',  traffic: '3.82 GB' },
    'HUAWEI Mate 60':  { type: '智能手机', ip: '192.168.0.105', mac: '34:12:F8:6C:AA:09', dur: '1h 42m', rssi: '-47 dBm (优秀)',  traffic: '0.64 GB' },
    '直播摄像机 A':      { type: '摄像设备', ip: '192.168.0.108', mac: '00:E0:4C:68:1B:F5', dur: '4h 23m', rssi: '-55 dBm (良好)',  traffic: '12.6 GB' },
    'iPad Air':        { type: '平板电脑', ip: '192.168.0.110', mac: 'BC:54:2F:D3:17:8E', dur: '38m',    rssi: '-39 dBm (优秀)',  traffic: '0.41 GB' },
  };

  var currentDetailName = '';

  document.querySelectorAll('.ci-main').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      var name = el.querySelector('b').textContent;
      var d = mockData[name];
      if (!d || !ddSheet) return;
      currentDetailName = name;
      ddName.textContent = name;
      ddType.textContent = d.type;
      ddIp.textContent = d.ip;
      ddMac.textContent = d.mac;
      ddDur.textContent = d.dur;
      ddRssi.textContent = d.rssi;
      ddTraffic.textContent = d.traffic;
      openSheet(ddSheet);
    });
  });

  if (ddClose) ddClose.addEventListener('click', closeSheet);

  // === 断开确认弹窗 ===
  var confirmMask   = document.getElementById('confirmMask');
  var confirmDialog = document.getElementById('confirmDialog');
  var cdDevName     = document.getElementById('cdDevName');
  var cdCancel      = document.getElementById('cdCancel');
  var cdOk          = document.getElementById('cdOk');
  var pendingKickName = '';

  function showConfirm(name) {
    pendingKickName = name;
    cdDevName.textContent = name;
    confirmMask.classList.add('show');
    confirmDialog.classList.add('show');
  }
  function hideConfirm() {
    confirmMask.classList.remove('show');
    confirmDialog.classList.remove('show');
    pendingKickName = '';
  }

  function doKick(name) {
    var items = document.querySelectorAll('.conn-item');
    items.forEach(function (item) {
      var b = item.querySelector('.ci-main b');
      if (b && b.textContent === name) {
        item.classList.add('removing');
        setTimeout(function () {
          item.remove();
          var countEl = document.getElementById('devCount');
          if (countEl) {
            var remaining = document.querySelectorAll('.conn-item').length;
            countEl.textContent = remaining;
          }
        }, 350);
      }
    });
  }

  // 列表中的断开按钮
  document.querySelectorAll('.ci-kick').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      showConfirm(btn.dataset.name);
    });
  });

  // 详情抽屉中的断开按钮
  if (ddKick) {
    ddKick.addEventListener('click', function () {
      closeSheet();
      setTimeout(function () { showConfirm(currentDetailName); }, 300);
    });
  }

  if (cdCancel) cdCancel.addEventListener('click', hideConfirm);
  if (confirmMask) confirmMask.addEventListener('click', hideConfirm);
  if (cdOk) {
    cdOk.addEventListener('click', function () {
      doKick(pendingKickName);
      hideConfirm();
    });
  }

  // === Tabbar 高亮 ===
  document.querySelectorAll('.tabbar .tab').forEach(function (t) {
    t.addEventListener('click', function () {
      if (t.getAttribute('href')) return;
      document.querySelectorAll('.tabbar .tab').forEach(function (x) { x.classList.remove('active'); });
      if (!t.classList.contains('center')) t.classList.add('active');
    });
  });
})();
