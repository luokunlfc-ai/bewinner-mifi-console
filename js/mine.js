/* Be Winner MiFi · 我的页交互 */

(function () {
  // === 通用遮罩 & 抽屉 ===
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

  // 通用关闭
  document.querySelectorAll('.sheet-close').forEach(function (btn) {
    btn.addEventListener('click', closeSheet);
  });

  // === 账号管理（点击头像打开） ===
  var accountSheet = document.getElementById('accountSheet');
  var btnEditProfile = document.getElementById('btnEditProfile');
  if (btnEditProfile) btnEditProfile.addEventListener('click', function () { openSheet(accountSheet); });

  var acSaveBtn = accountSheet ? accountSheet.querySelector('.save-btn') : null;
  if (acSaveBtn) {
    acSaveBtn.addEventListener('click', function () {
      acSaveBtn.textContent = '已保存 ✓';
      acSaveBtn.style.background = '#22c55e';
      setTimeout(function () {
        acSaveBtn.textContent = '保存';
        acSaveBtn.style.background = '';
        closeSheet();
      }, 800);
    });
  }

  // === 购买记录 ===
  var purchaseSheet = document.getElementById('purchaseSheet');
  var btnPurchase = document.getElementById('btnPurchaseHistory');
  var purchaseList = document.getElementById('purchaseList');

  var mockPurchases = [
    { name: '月享100GB年包', amount: '¥799', date: '2026-03-15', expiry: '2026-03-15 至 2027-03-14', device: 'BW-X9 Pro' },
    { name: '60G聚合套餐', amount: '¥69', date: '2026-04-01', expiry: '2026-04-01 至 2026-04-30', device: 'BW-X9 Pro' },
    { name: '月享100GB年包', amount: '¥799', date: '2025-12-20', expiry: '2025-12-20 至 2026-12-19', device: 'BW-X7' },
    { name: '10GB体验月包', amount: '¥9.9', date: '2025-11-05', expiry: '2025-11-05 至 2025-12-04', device: 'BW-X7' },
    { name: '150GB大流量月包', amount: '¥149', date: '2025-08-12', expiry: '2025-08-12 至 2025-09-11', device: 'BW-X9 Pro' },
    { name: '60G聚合套餐', amount: '¥599', date: '2025-06-18', expiry: '2025-06-18 至 2026-06-17', device: 'BW-N7' },
    { name: '会员年包100GB', amount: '¥699', date: '2025-03-01', expiry: '2025-03-01 至 2026-02-28', device: 'BW-X9 Pro' },
    { name: '30GB体验月包', amount: '¥29', date: '2025-01-10', expiry: '2025-01-10 至 2025-02-09', device: 'BW-X7' },
  ];

  function renderPurchaseList() {
    if (!purchaseList) return;
    var html = '';
    mockPurchases.forEach(function(item) {
      html += '<div class="purchase-item">'
        + '<div class="pi-top">'
          + '<span class="pi-name">' + item.name + '</span>'
          + '<span class="pi-amount mono">' + item.amount + '</span>'
        + '</div>'
        + '<div class="pi-device">设备：' + (item.device || '--') + '</div>'
        + '<div class="pi-bottom">'
          + '<span class="pi-date">订购：' + item.date + '</span>'
          + '<span class="pi-expiry">有效期：' + item.expiry + '</span>'
        + '</div>'
        + '</div>';
    });
    purchaseList.innerHTML = html;
  }

  if (btnPurchase && purchaseSheet) {
    btnPurchase.addEventListener('click', function(e) {
      e.preventDefault();
      renderPurchaseList();
      openSheet(purchaseSheet);
    });
  }

  var purchaseClose = document.getElementById('purchaseClose');
  if (purchaseClose) purchaseClose.addEventListener('click', closeSheet);

  // === 无设备拦截 ===
  function requireDevice(action) {
    if (!MiFiUser.isDeviceBound()) {
      MiFiUI.showToast('请先添加设备');
      return false;
    }
    return true;
  }

  // 我的套餐链接拦截
  var myPlanLink = document.querySelector('.qr-item[href="plan.html"]');
  if (myPlanLink) {
    myPlanLink.addEventListener('click', function(e) {
      if (!requireDevice()) { e.preventDefault(); }
    });
  }

  // === 数据卡管理 ===
  var dataCardSheet = document.getElementById('dataCardSheet');
  var btnDataCard = document.getElementById('btnDataCard');
  var curCardEl = document.getElementById('curCard');
  if (btnDataCard) btnDataCard.addEventListener('click', function () {
    if (!requireDevice()) return;
    openSheet(dataCardSheet);
  });

  if (dataCardSheet) {
    dataCardSheet.querySelectorAll('.card-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        dataCardSheet.querySelectorAll('.card-option').forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');
        if (curCardEl) curCardEl.textContent = opt.dataset.card;
        setTimeout(closeSheet, 200);
      });
    });
  }

  // === 固件升级（双状态） ===
  var fwSheet = document.getElementById('fwSheet');
  var btnFirmware = document.getElementById('btnFirmware');
  var fwUpdateBtn = document.getElementById('fwUpdateBtn');
  var fwBadge = document.getElementById('fwBadge');
  var fwVer = document.getElementById('fwVer');
  var fwHasUpdate = document.getElementById('fwHasUpdate');
  var fwUpToDate = document.getElementById('fwUpToDate');

  function applyFwState() {
    var hasUpdate = MiFiUser.hasFwUpdate();
    if (fwBadge) fwBadge.style.display = hasUpdate ? '' : 'none';
    if (fwHasUpdate) fwHasUpdate.style.display = hasUpdate ? '' : 'none';
    if (fwUpToDate) fwUpToDate.style.display = hasUpdate ? 'none' : '';
  }

  if (btnFirmware) btnFirmware.addEventListener('click', function () {
    if (!requireDevice()) return;
    applyFwState();
    openSheet(fwSheet);
  });

  if (fwUpdateBtn) {
    fwUpdateBtn.addEventListener('click', function () {
      fwUpdateBtn.disabled = true;
      fwUpdateBtn.textContent = '升级中…';
      fwUpdateBtn.style.background = '#94a3b8';
      var progress = 0;
      var iv = setInterval(function () {
        progress += Math.random() * 20 + 5;
        if (progress >= 100) {
          clearInterval(iv);
          fwUpdateBtn.textContent = '升级成功 ✓';
          fwUpdateBtn.style.background = '#22c55e';
          MiFiUser.setFwUpdate(false);
          if (fwBadge) fwBadge.style.display = 'none';
          if (fwVer) fwVer.textContent = 'v2.5.0';
          setTimeout(function () {
            // 切换到已是最新状态
            if (fwHasUpdate) fwHasUpdate.style.display = 'none';
            if (fwUpToDate) fwUpToDate.style.display = '';
            fwUpdateBtn.style.display = 'none';
          }, 1200);
        } else {
          fwUpdateBtn.textContent = '升级中 ' + Math.min(Math.round(progress), 99) + '%…';
        }
      }, 400);
    });
  }

  // 初始化固件状态
  applyFwState();

  // === 网络诊断 ===
  var diagSheet = document.getElementById('diagSheet');
  var btnDiag = document.getElementById('btnDiag');
  var diagStart = document.getElementById('diagStart');
  if (btnDiag) btnDiag.addEventListener('click', function () {
    if (!requireDevice()) return;
    openSheet(diagSheet);
  });

  // === 信道优选 ===
  var btnChannelOpt = document.getElementById('btnChannelOpt');
  if (btnChannelOpt) {
    btnChannelOpt.addEventListener('click', function() {
      if (!requireDevice()) return;
      // 暂无需设置点击效果
    });
  }

  if (diagStart) {
    diagStart.addEventListener('click', function () {
      var steps = document.querySelectorAll('#diagSteps .ds');
      diagStart.disabled = true;
      diagStart.textContent = '诊断中…';
      diagStart.style.background = '#94a3b8';

      // 重置
      steps.forEach(function (s) {
        s.className = 'ds';
        s.querySelector('.ds-status').textContent = '等待中';
      });

      var i = 0;
      function runStep() {
        if (i >= steps.length) {
          diagStart.textContent = '诊断完成';
          diagStart.style.background = '#22c55e';
          setTimeout(function () {
            diagStart.textContent = '重新诊断';
            diagStart.style.background = '';
            diagStart.disabled = false;
          }, 1500);
          return;
        }
        var s = steps[i];
        s.className = 'ds running';
        s.querySelector('.ds-status').textContent = '检测中…';
        setTimeout(function () {
          var pass = Math.random() > 0.1;
          s.className = 'ds ' + (pass ? 'pass' : 'fail');
          s.querySelector('.ds-status').textContent = pass ? '通过' : '异常';
          i++;
          runStep();
        }, 600 + Math.random() * 800);
      }
      runStep();
    });
  }

  // === 我的设备 ===
  var myDevicesSheet = document.getElementById('myDevicesSheet');
  var myDevicesList = document.getElementById('myDevicesList');
  var myDevicesClose = document.getElementById('myDevicesClose');
  var btnMyDevices = document.getElementById('btnMyDevices');

  function renderMyDevices() {
    if (!myDevicesList) return;
    var devices = MiFiDevice.getAll();
    var current = MiFiDevice.getCurrent();
    var currentId = current ? current.id : '';

    if (devices.length === 0) {
      myDevicesList.innerHTML = '<li class="my-device-empty"><div class="empty-icon" style="margin-bottom:12px;"><svg viewBox="0 0 48 48" fill="none" stroke="var(--text-3)" stroke-width="1.5"><rect x="8" y="16" width="32" height="24" rx="4"/><path d="M14 16v-3a10 10 0 0 1 10-10h0a10 10 0 0 1 10 10v3"/></svg></div><p style="font-size:13px;color:var(--text-2);font-weight:600;">暂无绑定设备</p><p style="font-size:11px;color:var(--text-3);">请在主页右上角 + 添加设备</p></li>';
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
        + '<div class="mdi-left">'
          + '<div class="mdi-ico ' + (dev.online ? 'online' : 'offline') + '"><span></span></div>'
          + '<div class="mdi-info">'
            + '<div class="mdi-name-row"><b>' + MiFiDevice.getDisplayName(dev) + '</b><button class="mdi-rename-btn" data-device-id="' + dev.id + '" aria-label="重命名"><svg viewBox="0 0 24 24"><path d="M17 3a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L17 3z"/></svg></button></div>'
            + '<span>SN: ' + dev.sn + ' · ' + (dev.type === 'bonding' ? '聚合款' : '5G MiFi') + ' · ' + (dev.online ? '在线' : '离线') + '</span>'
          + '</div>'
        + '</div>'
        + '<div class="mdi-actions">'
          + (isCurrent ? '<span class="mdi-current-tag">当前</span>' : '<button class="mdi-switch-btn" data-device-id="' + dev.id + '">切换</button>')
          + '<button class="mdi-delete-btn" data-device-id="' + dev.id + '">'
            + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>'
          + '</button>'
        + '</div>'
        + '</li>';
    });
    myDevicesList.innerHTML = html;

    // 切换按钮
    myDevicesList.querySelectorAll('.mdi-switch-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var deviceId = btn.dataset.deviceId;
        MiFiDevice.setCurrent(deviceId);
        closeSheet();
        MiFiUI.showToast('已切换设备');
        // 延迟刷新列表
        setTimeout(renderMyDevices, 300);
      });
    });

    // 删除按钮
    myDevicesList.querySelectorAll('.mdi-delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var deviceId = btn.dataset.deviceId;
        var dev = MiFiDevice.getAll().find(function(d) { return d.id === deviceId; });
        var deleteDevName = document.getElementById('deleteDevName');
        if (deleteDevName) deleteDevName.textContent = dev ? MiFiDevice.getDisplayName(dev) : '';
        document.getElementById('deleteConfirmMask').classList.add('show');
        document.getElementById('deleteConfirmDialog').classList.add('show');
        // 暂存待删除设备ID
        document.getElementById('deleteConfirmDialog')._pendingId = deviceId;
      });
    });

    // 重命名按钮
    myDevicesList.querySelectorAll('.mdi-rename-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
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

  if (btnMyDevices && myDevicesSheet) {
    btnMyDevices.addEventListener('click', function() {
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
      if (deviceId) {
        MiFiDevice.removeDevice(deviceId);
      }
      hideDeleteConfirm();

      // 检查是否还有设备
      if (!MiFiUser.isDeviceBound()) {
        closeSheet();
        MiFiUI.showToast('所有设备已删除');
        return;
      }

      // 刷新设备列表
      renderMyDevices();
      // 如果当前设备被删除，关闭抽屉刷新
      var current = MiFiDevice.getCurrent();
      if (current && current.id !== deviceId) {
        MiFiUI.showToast('设备已删除');
      } else {
        MiFiUI.showToast('设备已删除，已自动切换');
      }
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
      renderMyDevices();
      MiFiUI.showToast('设备名称已更新');
    });
  }

  // 更新"我的设备"副标题为当前设备名称
  function updateDeviceSubtitle() {
    var subtitle = document.getElementById('myDevicesSubtitle');
    if (!subtitle) return;
    var dev = MiFiDevice.getCurrent();
    subtitle.textContent = dev ? MiFiDevice.getDisplayName(dev) : '暂无设备';
  }
  updateDeviceSubtitle();

  // === Tabbar ===
  document.querySelectorAll('.tabbar .tab').forEach(function (t) {
    t.addEventListener('click', function () {
      if (t.getAttribute('href')) return;
      document.querySelectorAll('.tabbar .tab').forEach(function (x) { x.classList.remove('active'); });
      if (!t.classList.contains('center')) t.classList.add('active');
    });
  });
})();
