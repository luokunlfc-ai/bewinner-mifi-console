/* Be Winner MiFi · WiFi 管理页交互 */
(function () {

  // ===== 主状态应用 =====
  function applyAllStates() {
    var hasDevice = MiFiUser.isDeviceBound();
    var dev = MiFiDevice.getCurrent();
    var online = dev ? dev.online : false;

    var emptyDevice = document.getElementById('emptyDevice');
    var wifiContent = document.getElementById('wifiContent');
    var titleBar = document.getElementById('deviceTitleBar');

    // 无设备状态
    if (!hasDevice || !dev) {
      if (emptyDevice) emptyDevice.style.display = '';
      if (wifiContent) wifiContent.style.display = 'none';
      if (titleBar) titleBar.style.display = 'none';
      return;
    }

    if (emptyDevice) emptyDevice.style.display = 'none';
    if (wifiContent) wifiContent.style.display = '';
    if (titleBar) titleBar.style.display = '';

    // 设备标题栏
    var modelEl = document.getElementById('wifiDeviceModel');
    var statusEl = document.getElementById('wifiDeviceStatus');
    var wifiEl = document.getElementById('wifiDeviceWifi');
    if (modelEl) modelEl.textContent = MiFiDevice.getDisplayName(dev);
    if (statusEl) {
      if (online) {
        statusEl.className = 'device-title-status online';
        statusEl.textContent = '在线';
      } else {
        statusEl.className = 'device-title-status offline';
        statusEl.textContent = '离线';
      }
    }
    if (wifiEl) {
      var wifiOn = MiFiDevice.isWifiConnected();
      wifiEl.className = 'device-title-wifi' + (wifiOn ? ' connected' : '');
      wifiEl.textContent = 'WiFi';
    }

    // 更新 SSID
    updateWifiForDevice(dev);

    // 离线状态
    applyOfflineState(online);
  }

  // ===== 离线状态 =====
  function applyOfflineState(online) {
    var btnSet = document.getElementById('btnWifiSetting');
    var connList = document.querySelector('.conn-list');
    var connHead = document.querySelector('.conn-head');
    var connEmpty = document.getElementById('connEmpty');
    var anim = document.querySelector('.wifi-anim');

    // WiFi 设置按钮
    if (btnSet) {
      if (online) {
        btnSet.classList.remove('disabled');
        btnSet.disabled = false;
      } else {
        btnSet.classList.add('disabled');
        btnSet.disabled = true;
      }
    }

    // 安全类型和频段
    var secEl = document.getElementById('wifiSecType');
    var bandEl = document.getElementById('wifiBand');
    if (!online) {
      if (secEl) secEl.textContent = '--';
      if (bandEl) bandEl.textContent = '--';
      // WiFi 动画停止
      if (anim) anim.classList.add('paused');
    } else {
      if (secEl) secEl.textContent = 'WPA2/WPA3';
      if (bandEl) bandEl.textContent = '5GHz';
      if (anim) anim.classList.remove('paused');
    }

    // 已连接设备列表
    if (!online) {
      if (connList) connList.style.display = 'none';
      if (connHead) connHead.style.display = 'none';
      if (connEmpty) connEmpty.style.display = '';
    } else {
      if (connList) connList.style.display = '';
      if (connHead) connHead.style.display = '';
      if (connEmpty) connEmpty.style.display = 'none';
    }
  }

  // ===== 更新 WiFi SSID =====
  function updateWifiForDevice(dev) {
    var ssid = MiFiDevice.getSsid(dev.id);
    var ssidEls = document.querySelectorAll('.wd-val.mono');
    ssidEls.forEach(function(el) {
      if (el.firstChild && el.firstChild.nodeType === 3 && el.textContent.indexOf('BW-') === 0) {
        el.childNodes[0].textContent = ssid;
      }
    });
    // 同步频段独立 SSID 配置
    wifiBandConfig['5G'].ssid = ssid;
    // 2.4G SSID：基础名去掉 _5G 后缀，加上 _2.4G
    var ssid24 = ssid.replace(/_5G$/, '') + '_2.4G';
    wifiBandConfig['2.4G'].ssid = ssid24;
    // 更新表单中的 SSID 输入框
    var ssidInput = document.getElementById('wifiSsidInput');
    if (ssidInput) ssidInput.value = wifiBandConfig[currentWifiBand].ssid;
  }

  // ===== 通用遮罩 & 抽屉控制 =====
  var mask = document.getElementById('sheetMask');
  var activeSheet = null;

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

  // ===== 我的设备抽屉 =====
  var myDevicesSheet = document.getElementById('myDevicesSheet');
  var myDevicesList = document.getElementById('myDevicesList');

  // 左滑删除状态（跨 renderMyDevices 调用保持）
  var swipedItem = null;
  function closeSwipe() {
    if (swipedItem) {
      var inner = swipedItem.querySelector('.mdi-swipe-inner');
      if (inner) inner.classList.remove('swiped');
      swipedItem = null;
    }
  }
  if (myDevicesList) myDevicesList.addEventListener('scroll', closeSwipe);

  function renderMyDevices() {
    if (!myDevicesList) return;
    var devices = MiFiDevice.getAll();
    var current = MiFiDevice.getCurrent();
    var currentId = current ? current.id : '';

    if (devices.length === 0) {
      myDevicesList.innerHTML = '<li class="my-device-empty"><div class="empty-icon" style="margin-bottom:12px;"><svg viewBox="0 0 48 48" fill="none" stroke="var(--text-3)" stroke-width="1.5"><rect x="8" y="16" width="32" height="24" rx="4"/><path d="M14 16v-3a10 10 0 0 1 10-10h0a10 10 0 0 1 10 10v3"/></svg></div><p style="font-size:13px;color:var(--text-2);font-weight:600;">暂无绑定设备</p><p style="font-size:11px;color:var(--text-3);">请在右上角 + 添加设备</p></li>';
      return;
    }

    // 排序：当前设备排第一，离线非当前设备排最后
    devices.sort(function(a, b) {
      if (a.id === currentId) return -1;
      if (b.id === currentId) return 1;
      if (a.online && !b.online) return -1;
      if (!a.online && b.online) return 1;
      return 0;
    });

    var html = '';
    devices.forEach(function(dev) {
      var isCurrent = dev.id === currentId;
      html += '<li class="my-device-item' + (isCurrent ? ' current' : '') + '" data-device-id="' + dev.id + '">'
        + '<div class="mdi-swipe-inner">'
          + '<div class="mdi-main">'
            + '<div class="mdi-left">'
          + '<div class="mdi-ico ' + (dev.online ? 'online' : 'offline') + '"><span></span></div>'
          + '<div class="mdi-info">'
            + '<div class="mdi-name-row"><b>' + MiFiDevice.getDisplayName(dev) + '</b><button class="mdi-rename-btn" data-device-id="' + dev.id + '" aria-label="重命名"><svg viewBox="0 0 24 24"><path d="M17 3a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L17 3z"/></svg></button></div>'
            + '<span>SN: ' + dev.sn + ' · ' + (dev.type === 'bonding' ? '聚合款' : '5G MiFi') + ' · ' + (dev.online ? '在线' : '离线') + '</span>'
          + '</div>'
        + '</div>'
            + '<div class="mdi-tag-area">'
              + (isCurrent ? '<span class="mdi-current-tag">当前</span>' : '<button class="mdi-switch-btn" data-device-id="' + dev.id + '">切换</button>')
            + '</div>'
          + '</div>'
          + '<div class="mdi-delete-zone">'
            + '<button class="mdi-delete-btn" data-device-id="' + dev.id + '">'
              + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>'
            + '</button>'
          + '</div>'
        + '</div>'
        + '</li>';
    });
    myDevicesList.innerHTML = html;

    // --- 左滑删除手势绑定（触屏 + 鼠标） ---
    myDevicesList.querySelectorAll('.my-device-item').forEach(function(item) {
      var startX = 0, startY = 0;
      var dragging = false;

      function onStart(clientX, clientY) {
        if (swipedItem && swipedItem !== item) closeSwipe();
        startX = clientX;
        startY = clientY;
        dragging = true;
      }

      function onMove(clientX, clientY) {
        if (!dragging) return;
        var dx = clientX - startX;
        var dy = Math.abs(clientY - startY);
        if (Math.abs(dx) > 8 && Math.abs(dx) > dy) {
          item.querySelector('.mdi-swipe-inner').style.transition = 'none';
          var tx = Math.min(0, Math.max(-68, dx));
          item.querySelector('.mdi-swipe-inner').style.transform = 'translateX(' + tx + 'px)';
        }
      }

      function onEnd(clientX, clientY) {
        if (!dragging) { dragging = false; return; }
        dragging = false;
        var inner = item.querySelector('.mdi-swipe-inner');
        inner.style.transition = '';
        inner.style.transform = '';
        var dx = clientX - startX;
        var dy = Math.abs(clientY - startY);
        if (dx < -30 && Math.abs(dx) > dy) {
          inner.classList.add('swiped');
          swipedItem = item;
        } else if (dx > 30 && Math.abs(dx) > dy) {
          closeSwipe();
        } else if (swipedItem === item && Math.abs(dx) < 5) {
          closeSwipe();
        }
      }

      item.addEventListener('touchstart', function(e) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      item.addEventListener('touchmove', function(e) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      item.addEventListener('touchend', function(e) {
        onEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      });

      item.addEventListener('mousedown', function(e) {
        if (e.button === 0) onStart(e.clientX, e.clientY);
      });
      document.addEventListener('mousemove', function(e) {
        if (dragging) { onMove(e.clientX, e.clientY); }
      });
      document.addEventListener('mouseup', function(e) {
        if (dragging) { onEnd(e.clientX, e.clientY); }
      });
    });

    myDevicesList.querySelectorAll('.mdi-switch-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeSwipe();
        var deviceId = btn.dataset.deviceId;
        MiFiDevice.setCurrent(deviceId);
        closeSheet();
        applyAllStates();
        renderMyDevices();
        MiFiUI.showToast('已切换设备');
      });
    });

    myDevicesList.querySelectorAll('.mdi-delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var deviceId = btn.dataset.deviceId;
        var dev = MiFiDevice.getAll().find(function(d) { return d.id === deviceId; });
        var deleteDevName = document.getElementById('deleteDevName');
        if (deleteDevName) deleteDevName.textContent = dev ? MiFiDevice.getDisplayName(dev) : '';
        document.getElementById('deleteConfirmMask').classList.add('show');
        document.getElementById('deleteConfirmDialog').classList.add('show');
        document.getElementById('deleteConfirmDialog')._pendingId = deviceId;
      });
    });

    // 重命名按钮
    myDevicesList.querySelectorAll('.mdi-rename-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeSwipe();
        var deviceId = btn.dataset.deviceId;
        var dev = MiFiDevice.getAll().find(function(d) { return d.id === deviceId; });
        var renameInput = document.getElementById('renameInput');
        var renameHint = document.getElementById('renameHint');
        if (renameInput) renameInput.value = dev ? (dev.name || dev.model) : '';
        if (renameHint) renameHint.style.display = 'none';
        document.getElementById('renameMask').classList.add('show');
        document.getElementById('renameDialog').classList.add('show');
        document.getElementById('renameDialog')._pendingId = deviceId;
        setTimeout(function() { if (renameInput) renameInput.focus(); }, 200);
      });
    });
  }

  // 设备切换抽屉（我的设备）
  var deviceTitleBar = document.getElementById('deviceTitleBar');
  var myDevicesClose = document.getElementById('myDevicesClose');
  if (deviceTitleBar && myDevicesSheet) {
    deviceTitleBar.addEventListener('click', function() {
      renderMyDevices();
      openSheet(myDevicesSheet);
    });
  }
  if (myDevicesClose) myDevicesClose.addEventListener('click', closeSheet);

  // 删除确认
  var deleteConfirmMask = document.getElementById('deleteConfirmMask');
  var deleteConfirmDialog = document.getElementById('deleteConfirmDialog');
  var deleteCancel = document.getElementById('deleteCancel');
  var deleteOk = document.getElementById('deleteOk');

  function hideDeleteConfirm() {
    if (deleteConfirmMask) deleteConfirmMask.classList.remove('show');
    if (deleteConfirmDialog) deleteConfirmDialog.classList.remove('show');
  }

  if (deleteCancel) deleteCancel.addEventListener('click', hideDeleteConfirm);
  if (deleteConfirmMask) deleteConfirmMask.addEventListener('click', hideDeleteConfirm);

  if (deleteOk) {
    deleteOk.addEventListener('click', function() {
      var deviceId = deleteConfirmDialog._pendingId;
      if (deviceId) MiFiDevice.removeDevice(deviceId);
      hideDeleteConfirm();
      if (!MiFiUser.isDeviceBound()) {
        closeSheet();
        applyAllStates();
        MiFiUI.showToast('所有设备已删除');
        return;
      }
      applyAllStates();
      renderMyDevices();
      MiFiUI.showToast('设备已删除');
    });
  }

  // 重命名确认弹窗
  var renameMask = document.getElementById('renameMask');
  var renameDialog = document.getElementById('renameDialog');
  var renameCancel = document.getElementById('renameCancel');
  var renameOk = document.getElementById('renameOk');
  var renameInput = document.getElementById('renameInput');
  var renameHint = document.getElementById('renameHint');

  function hideRenameDialog() {
    if (renameMask) renameMask.classList.remove('show');
    if (renameDialog) renameDialog.classList.remove('show');
  }

  if (renameCancel) renameCancel.addEventListener('click', hideRenameDialog);
  if (renameMask) renameMask.addEventListener('click', hideRenameDialog);

  if (renameOk) {
    renameOk.addEventListener('click', function() {
      var deviceId = renameDialog._pendingId;
      var newName = renameInput ? renameInput.value.trim() : '';
      if (!newName) {
        if (renameHint) { renameHint.textContent = '请输入设备名称'; renameHint.style.display = ''; }
        return;
      }
      if (newName.length > 20) {
        if (renameHint) { renameHint.textContent = '设备名称不能超过 20 个字符'; renameHint.style.display = ''; }
        return;
      }
      MiFiDevice.renameDevice(deviceId, newName);
      hideRenameDialog();
      applyAllStates();
      renderMyDevices();
      MiFiUI.showToast('设备名称已更新');
    });
  }

  // ===== 添加设备 =====
  var addDeviceSheet = document.getElementById('addDeviceSheet');
  var snInputSheet = document.getElementById('snInputSheet');
  var btnAddDevice = document.getElementById('btnAddDevice');

  // 空状态绑定设备按钮 → 打开添加设备弹窗
  var btnBindDevice = document.getElementById('btnBindDevice');
  if (btnBindDevice && addDeviceSheet) {
    btnBindDevice.addEventListener('click', function() {
      openSheet(addDeviceSheet);
    });
  }

  // ===== WiFi 密码切换 =====
  var eye = document.getElementById('wfEyeBtn');
  var pwd = document.getElementById('wfPwdText');
  var shown = false;
  if (eye && pwd) {
    var real = pwd.dataset.pwd || '';
    var masked = '•'.repeat(Math.max(real.length, 8));
    pwd.textContent = masked;
    eye.addEventListener('click', function(e) {
      e.stopPropagation();
      shown = !shown;
      pwd.textContent = shown ? real : masked;
      eye.querySelector('svg').innerHTML = shown
        ? '<path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.2 4.1"/><path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5-1.3"/>'
        : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
    });
  }

  // ===== WiFi 设置抽屉 =====
  var wifiSheet = document.getElementById('wifiSheet');
  var btnSet = document.getElementById('btnWifiSetting');
  var wifiClose = document.getElementById('wifiSheetClose');
  if (btnSet && wifiSheet) {
    btnSet.addEventListener('click', function() {
      if (btnSet.classList.contains('disabled')) return;
      openSheet(wifiSheet);
    });
  }
  if (wifiClose) wifiClose.addEventListener('click', closeSheet);

  var formEye = document.getElementById('formEyeBtn');
  var formPwd = document.getElementById('wifiPwdInput');
  if (formEye && formPwd) {
    formEye.addEventListener('click', function() {
      var isP = formPwd.type === 'password';
      formPwd.type = isP ? 'text' : 'password';
      formEye.querySelector('svg').innerHTML = isP
        ? '<path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-3.2 4.1"/><path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5-1.3"/>'
        : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
    });
  }

  // ===== WiFi 频段切换：独立配置 5G / 2.4G =====
  var wifiBandConfig = {
    '5G':   { ssid: 'BW-X9_5G',   password: 'LiveMifi@2026' },
    '2.4G': { ssid: 'BW-X9_2.4G', password: 'LiveMifi@2026' }
  };
  var currentWifiBand = '5G';

  function updateWifiFormForBand(band) {
    currentWifiBand = band;
    var cfg = wifiBandConfig[band];
    var ssidInput = document.getElementById('wifiSsidInput');
    var pwdInput  = document.getElementById('wifiPwdInput');
    if (ssidInput) ssidInput.value = cfg.ssid;
    if (pwdInput)  pwdInput.value  = cfg.password;
  }

  function saveCurrentWifiForm() {
    var ssidInput = document.getElementById('wifiSsidInput');
    var pwdInput  = document.getElementById('wifiPwdInput');
    if (ssidInput) wifiBandConfig[currentWifiBand].ssid = ssidInput.value;
    if (pwdInput)  wifiBandConfig[currentWifiBand].password = pwdInput.value;
  }

  var wifiBandSeg = document.getElementById('wifiBandSeg');
  if (wifiBandSeg) {
    wifiBandSeg.querySelectorAll('span').forEach(function(s) {
      s.addEventListener('click', function() {
        var band = s.dataset.band;
        if (!band || band === currentWifiBand) return;
        saveCurrentWifiForm();
        wifiBandSeg.querySelectorAll('span').forEach(function(x) { x.classList.remove('active'); });
        s.classList.add('active');
        updateWifiFormForBand(band);
      });
    });
  }

  document.querySelectorAll('.form-seg').forEach(function(seg) {
    if (seg === wifiBandSeg) return;
    seg.querySelectorAll('span').forEach(function(s) {
      s.addEventListener('click', function() {
        seg.querySelectorAll('span').forEach(function(x) { x.classList.remove('active'); });
        s.classList.add('active');
      });
    });
  });

  document.querySelectorAll('.toggle').forEach(function(t) {
    t.addEventListener('click', function() { t.classList.toggle('on'); });
  });

  var saveBtn = document.querySelector('.save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      var orig = saveBtn.textContent;
      saveBtn.textContent = '已保存 ✓';
      saveBtn.style.background = '#22c55e';
      setTimeout(function() {
        saveBtn.textContent = orig;
        saveBtn.style.background = '';
        closeSheet();
      }, 800);
    });
  }

  // ===== 设备详情抽屉 =====
  var ddSheet = document.getElementById('devDetailSheet');
  var ddClose = document.getElementById('ddClose');
  var ddName  = document.getElementById('ddName');
  var ddType  = document.getElementById('ddType');
  var ddIp    = document.getElementById('ddIp');
  var ddMac   = document.getElementById('ddMac');
  var ddDur   = document.getElementById('ddDur');
  var ddRssi  = document.getElementById('ddRssi');
  var ddTraffic = document.getElementById('ddTraffic');
  var ddKick  = document.getElementById('ddKick');

  var mockData = {
    'iPhone 15 Pro':   { type: '智能手机', ip: '192.168.0.101', mac: 'A4:CF:12:8B:3D:E7', dur: '2h 15m', rssi: '-42 dBm (优秀)',  traffic: '1.28 GB' },
    'MacBook Pro':     { type: '笔记本电脑', ip: '192.168.0.102', mac: 'F8:4D:89:2A:CC:41', dur: '4h 03m', rssi: '-51 dBm (良好)',  traffic: '3.82 GB' },
    'HUAWEI Mate 60':  { type: '智能手机', ip: '192.168.0.105', mac: '34:12:F8:6C:AA:09', dur: '1h 42m', rssi: '-47 dBm (优秀)',  traffic: '0.64 GB' },
    '直播摄像机 A':      { type: '摄像设备', ip: '192.168.0.108', mac: '00:E0:4C:68:1B:F5', dur: '4h 23m', rssi: '-55 dBm (良好)',  traffic: '12.6 GB' },
    'iPad Air':        { type: '平板电脑', ip: '192.168.0.110', mac: 'BC:54:2F:D3:17:8E', dur: '38m',    rssi: '-39 dBm (优秀)',  traffic: '0.41 GB' },
  };

  var currentDetailName = '';

  document.querySelectorAll('.ci-main').forEach(function(el) {
    el.addEventListener('click', function(e) {
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

  // ===== 断开确认弹窗 =====
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
    items.forEach(function(item) {
      var b = item.querySelector('.ci-main b');
      if (b && b.textContent === name) {
        item.classList.add('removing');
        setTimeout(function() {
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

  document.querySelectorAll('.ci-kick').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      showConfirm(btn.dataset.name);
    });
  });

  if (ddKick) {
    ddKick.addEventListener('click', function() {
      closeSheet();
      setTimeout(function() { showConfirm(currentDetailName); }, 300);
    });
  }

  if (cdCancel) cdCancel.addEventListener('click', hideConfirm);
  if (confirmMask) confirmMask.addEventListener('click', hideConfirm);
  if (cdOk) {
    cdOk.addEventListener('click', function() {
      doKick(pendingKickName);
      hideConfirm();
    });
  }

  // ===== Tabbar =====
  document.querySelectorAll('.tabbar .tab').forEach(function(t) {
    t.addEventListener('click', function(e) {
      if (t.getAttribute('href')) {
        var href = t.getAttribute('href');
        if (!MiFiUser.isDeviceBound() && !href.includes('mine')) {
          e.preventDefault();
          MiFiUI.showToast('请先添加设备');
        }
        return;
      }
      document.querySelectorAll('.tabbar .tab').forEach(function(x) { x.classList.remove('active'); });
      t.classList.add('active');
    });
  });

  if (btnAddDevice && addDeviceSheet) {
    btnAddDevice.addEventListener('click', function() { openSheet(addDeviceSheet); });
  }

  var addDeviceClose = document.getElementById('addDeviceClose');
  if (addDeviceClose) addDeviceClose.addEventListener('click', closeSheet);

  var snInputClose = document.getElementById('snInputClose');
  if (snInputClose) snInputClose.addEventListener('click', function() {
    closeSheet();
    if (addDeviceSheet) setTimeout(function() { openSheet(addDeviceSheet); }, 350);
  });

  var adoQr = document.getElementById('adoQr');
  if (adoQr) {
    adoQr.addEventListener('click', function() {
      closeSheet();
      MiFiUI.showToast('正在启动扫码…');
    });
  }

  var adoSn = document.getElementById('adoSn');
  if (adoSn && snInputSheet) {
    adoSn.addEventListener('click', function() {
      closeSheet();
      setTimeout(function() {
        var snField = document.getElementById('snInputField');
        if (snField) snField.value = '';
        var snHint = document.getElementById('snHint');
        if (snHint) snHint.textContent = '';
        openSheet(snInputSheet);
      }, 350);
    });
  }

  var snConfirmBtn = document.getElementById('snConfirmBtn');
  if (snConfirmBtn) {
    snConfirmBtn.addEventListener('click', function() {
      var snField = document.getElementById('snInputField');
      var snHint = document.getElementById('snHint');
      var sn = snField ? snField.value.trim() : '';
      if (!sn) {
        if (snHint) { snHint.textContent = '请输入 SN 码'; snHint.style.color = 'var(--err)'; }
        return;
      }
      if (sn.length < 6) {
        if (snHint) { snHint.textContent = 'SN 码格式不正确'; snHint.style.color = 'var(--err)'; }
        return;
      }
      snConfirmBtn.textContent = '添加中…';
      snConfirmBtn.disabled = true;
      setTimeout(function() {
        MiFiDevice.resetToDefaultDevices();
        closeSheet();
        applyAllStates();
        renderMyDevices();
        MiFiUI.showToast('设备添加成功');
        snConfirmBtn.textContent = '确认添加';
        snConfirmBtn.disabled = false;
      }, 600);
    });
  }

  // ===== 初始化 =====
  applyAllStates();
  renderMyDevices();
})();
