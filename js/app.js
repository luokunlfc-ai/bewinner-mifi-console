/* Be Winner MiFi · Home Interactions */
(function () {
  var rateTimer = null;

  // ===== 主状态应用函数 =====
  function applyAllStates() {
    var hasDevice = MiFiUser.isDeviceBound();
    var hasPlan = MiFiUser.isPlanPurchased();
    var dev = MiFiDevice.getCurrent();
    var online = dev ? dev.online : false;

    // 无设备状态
    var emptyDevice = document.getElementById('emptyDevice');
    var homeContent = document.getElementById('homeContent');
    var titleBar = document.getElementById('deviceTitleBar');

    if (!hasDevice || !dev) {
      if (emptyDevice) emptyDevice.style.display = '';
      if (homeContent) homeContent.style.display = 'none';
      if (titleBar) titleBar.style.display = 'none';
      stopRateLoop();
      return;
    }

    // 有设备
    if (emptyDevice) emptyDevice.style.display = 'none';
    if (homeContent) homeContent.style.display = '';
    if (titleBar) titleBar.style.display = '';

    // 设备标题栏
    var titleName = document.getElementById('deviceTitleName');
    var titleStatus = document.getElementById('deviceTitleStatus');
    if (titleName) titleName.textContent = MiFiDevice.getDisplayName(dev);
    if (titleStatus) {
      if (online) {
        titleStatus.className = 'device-title-status online';
        titleStatus.textContent = '在线';
      } else {
        titleStatus.className = 'device-title-status offline';
        titleStatus.textContent = '离线';
      }
    }

    var isBonding = dev.type === 'bonding';

    // 聚合中状态胶囊
    var statusPill = document.getElementById('statusPillBonded');
    if (statusPill) statusPill.style.display = (isBonding && online) ? 'inline-flex' : 'none';

    // 聚合套餐行
    var bondRow = document.getElementById('planRowBond');
    var planDivider = document.getElementById('planDivider');
    if (bondRow) bondRow.style.display = isBonding ? '' : 'none';
    if (planDivider) planDivider.style.display = isBonding ? '' : 'none';

    // 聚合网络管理卡片
    var bondNetCard = document.getElementById('bondNetCard');
    if (bondNetCard) bondNetCard.style.display = (isBonding && online) ? '' : 'none';

    // 子卡速率（聚合设备）
    var rateSubCards = document.getElementById('rateSubCards');
    if (rateSubCards) rateSubCards.style.display = (isBonding && online) ? '' : 'none';
    if (isBonding && online) renderSubCardRows();

    // SVG 内文字
    var svgTextEl = document.querySelector('.mifi-svg text');
    if (svgTextEl) svgTextEl.textContent = isBonding ? 'BONDED' : '5G';

    // 离线状态：数据区
    applyOfflineState(online);

    // 套餐订购状态
    applyPlanState(hasPlan);

    // 速率动画
    if (online) {
      startRateLoop();
    } else {
      stopRateLoop();
      var downEl = document.getElementById('downNum');
      var upEl = document.getElementById('upNum');
      if (downEl) downEl.textContent = '--';
      if (upEl) upEl.textContent = '--';
      // 子卡速率也清空
      var cards = MiFiSim.getActive();
      cards.forEach(function(card) {
        var d = document.getElementById('subDown_' + card.id);
        var u = document.getElementById('subUp_' + card.id);
        var b = document.getElementById('subBar_' + card.id);
        if (d) d.textContent = '--';
        if (u) u.textContent = '--';
        if (b) b.style.width = '0%';
      });
    }
  }

  // ===== 离线状态 =====
  function applyOfflineState(online) {
    var dash = '--';
    // 设备运行数据
    var runEl = document.getElementById('devRunTime');
    var tempEl = document.getElementById('devTemp');
    var battEl = document.getElementById('devBatt');
    if (!online) {
      if (runEl) runEl.textContent = dash;
      if (tempEl) tempEl.textContent = dash;
      if (battEl) battEl.textContent = dash;
      // 信号值
      var sigMob = document.getElementById('sigMobVal');
      if (sigMob) sigMob.innerHTML = dash + '<small>dBm</small>';
      // 信号条变灰
      document.querySelectorAll('.sig-card').forEach(function(c) { c.classList.add('offline'); });
      document.querySelectorAll('.sig-bars').forEach(function(b) { b.classList.add('dim'); });
    } else {
      if (runEl) runEl.textContent = '04:23:11';
      if (tempEl) tempEl.textContent = '38.6°C';
      if (battEl) battEl.textContent = '82%';
      var sigMob = document.getElementById('sigMobVal');
      if (sigMob) sigMob.innerHTML = '-72<small>dBm</small>';
      document.querySelectorAll('.sig-card').forEach(function(c) { c.classList.remove('offline'); });
      document.querySelectorAll('.sig-bars').forEach(function(b) { b.classList.remove('dim'); });
    }
    // 电信卡实名状态始终展示（与设备在线/离线无关）
  }

  // ===== 套餐订购状态 =====
  function applyPlanState(hasPlan) {
    var planContent = document.getElementById('planContent');
    var planEmpty = document.getElementById('planEmpty');
    if (hasPlan) {
      if (planContent) planContent.style.display = '';
      if (planEmpty) planEmpty.style.display = 'none';
    } else {
      if (planContent) planContent.style.display = 'none';
      if (planEmpty) planEmpty.style.display = '';
    }
  }

  // ===== 速率数字滚动 =====
  function startRateLoop() {
    if (rateTimer) return;
    var downEl = document.getElementById('downNum');
    var upEl = document.getElementById('upNum');
    if (!downEl || !upEl) return;
    rateTimer = setInterval(function() {
      downEl.textContent = (80 + Math.random() * 80).toFixed(1);
      upEl.textContent   = (25 + Math.random() * 30).toFixed(1);
      updateSubCardRates();
    }, 1500);
  }

  function stopRateLoop() {
    if (rateTimer) { clearInterval(rateTimer); rateTimer = null; }
  }

  // ===== 子卡速率渲染 =====
  function renderSubCardRows() {
    var list = document.getElementById('rateSubList');
    if (!list) return;
    var cards = MiFiSim.getActive();
    var html = '';
    cards.forEach(function(card) {
      var cls = card.id === 'mob' ? 'mob' : (card.id === 'tel' ? 'tel' : 'ext');
      html += '<div class="rate-sub-item" data-card="' + card.id + '">'
        + '<span class="rate-sub-cname ' + cls + '">' + card.name + '</span>'
        + '<span class="rate-sub-dir"><span class="arr down">↓</span><span class="val mono" id="subDown_' + card.id + '">--</span><span class="unit">Mbps</span></span>'
        + '<span class="rate-sub-dir"><span class="arr up">↑</span><span class="val mono" id="subUp_' + card.id + '">--</span><span class="unit">Mbps</span></span>'
        + '<div class="rate-sub-bar"><span class="' + cls + '" id="subBar_' + card.id + '" style="width:0%"></span></div>'
        + '</div>';
    });
    list.innerHTML = html;
  }

  function updateSubCardRates() {
    var cards = MiFiSim.getActive();
    cards.forEach(function(card) {
      var down = (15 + Math.random() * 45).toFixed(1);
      var up   = (5  + Math.random() * 18).toFixed(1);
      var downEl = document.getElementById('subDown_' + card.id);
      var upEl   = document.getElementById('subUp_' + card.id);
      var barEl  = document.getElementById('subBar_' + card.id);
      if (downEl) downEl.textContent = down;
      if (upEl)   upEl.textContent   = up;
      if (barEl)  barEl.style.width  = (30 + Math.random() * 60) + '%';
    });
  }

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

  // ===== 通用遮罩 =====
  var mask = document.getElementById('sheetMask');
  var activeSheet = null;

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

  // ===== 设备切换抽屉（我的设备） =====
  var deviceTitleBar = document.getElementById('deviceTitleBar');
  var myDevicesClose = document.getElementById('myDevicesClose');
  if (deviceTitleBar && myDevicesSheet) {
    deviceTitleBar.addEventListener('click', function() {
      renderMyDevices();
      openSheet(myDevicesSheet);
    });
  }
  if (myDevicesClose) myDevicesClose.addEventListener('click', closeSheet);

  // ===== 添加设备 =====
  var addDeviceSheet = document.getElementById('addDeviceSheet');
  var snInputSheet = document.getElementById('snInputSheet');
  var btnAddDevice = document.getElementById('btnAddDevice');

  // "绑定新设备"按钮 → 打开添加设备弹窗
  var bindBtn = document.querySelector('.bind-btn');
  if (bindBtn && addDeviceSheet) {
    bindBtn.addEventListener('click', function() {
      closeSheet();
      setTimeout(function() { openSheet(addDeviceSheet); }, 350);
    });
  }

  // 无设备空状态中的"绑定设备"按钮 → 打开添加设备弹窗
  var btnBindDevice = document.getElementById('btnBindDevice');
  if (btnBindDevice && addDeviceSheet) {
    btnBindDevice.addEventListener('click', function() {
      openSheet(addDeviceSheet);
    });
  }

  // ===== 聚合网络管理 · 网卡切换 =====
  var cardSheet = document.getElementById('cardSheet');
  var sheetTitle = document.getElementById('sheetTitle');
  var cardHint = document.getElementById('cardHint');
  var pendingSlot = null;

  // 网卡分组：同组卡共享同一物理 Modem，两条链路不可同时使用同组卡
  var CARD_GROUP = {
    '移动': 'A',
    '外置卡1': 'A',
    '电信': 'B',
    '外置卡2': 'B'
  };

  function getOtherSlotCard() {
    if (!pendingSlot) return '';
    var other = pendingSlot === '1' ? '2' : '1';
    var el = document.getElementById('slot' + other + 'Name');
    return el ? el.textContent.trim() : '';
  }

  document.querySelectorAll('.bn-slot-change').forEach(function(btn) {
    btn.addEventListener('click', function() {
      pendingSlot = btn.dataset.slot;
      if (sheetTitle) sheetTitle.textContent = '选择链路 ' + (pendingSlot === '1' ? 'A' : 'B') + ' 网卡';
      var curName = document.getElementById('slot' + pendingSlot + 'Name').textContent;
      var otherCard = getOtherSlotCard();
      var otherGroup = CARD_GROUP[otherCard] || '';

      // 更新 cardSheet 中各选项的状态
      document.querySelectorAll('#cardSheet .card-option').forEach(function(opt) {
        var cardName = opt.dataset.card;
        opt.classList.toggle('active', cardName === curName);
        // 禁用与另一链路同组的卡
        if (otherGroup && CARD_GROUP[cardName] === otherGroup && cardName !== curName) {
          opt.classList.add('disabled');
        } else {
          opt.classList.remove('disabled');
        }
      });

      // 提示文字
      if (cardHint) {
        if (otherGroup) {
          var groupCards = otherGroup === 'A' ? '移动 / 外置卡1' : '电信 / 外置卡2';
          cardHint.textContent = '链路 ' + (pendingSlot === '1' ? 'B' : 'A') + ' 已占用 ' + groupCards + ' 组，同组卡不可重复选择';
          cardHint.style.display = '';
        } else {
          cardHint.style.display = 'none';
        }
      }

      openSheet(cardSheet);
    });
  });

  if (cardSheet) {
    var sheetClose = document.getElementById('sheetClose');
    if (sheetClose) sheetClose.addEventListener('click', closeSheet);
    cardSheet.querySelectorAll('.card-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        if (!pendingSlot) return;
        if (opt.classList.contains('disabled')) return;
        var cardName = opt.dataset.card;
        cardSheet.querySelectorAll('.card-option').forEach(function(o) { o.classList.remove('active'); });
        opt.classList.add('active');
        var slotNameEl = document.getElementById('slot' + pendingSlot + 'Name');
        if (slotNameEl) slotNameEl.textContent = cardName;
        var icoEl = document.querySelector('#slot' + pendingSlot + ' .bn-slot-ico');
        if (icoEl) {
          icoEl.className = 'bn-slot-ico';
          if (cardName === '移动') icoEl.classList.add('mob');
          else if (cardName === '电信') icoEl.classList.add('tel');
          else icoEl.classList.add('ext');
        }
        setTimeout(closeSheet, 200);
      });
    });
  }

  // ===== WiFi 设置抽屉 =====
  var wifiSheet = document.getElementById('wifiSheet');
  var btnWifi = document.getElementById('btnWifiSet');
  var wifiClose = document.getElementById('wifiSheetClose');
  if (btnWifi && wifiSheet) btnWifi.addEventListener('click', function() { openSheet(wifiSheet); });
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

  document.querySelectorAll('.form-seg').forEach(function(seg) {
    seg.querySelectorAll('span').forEach(function(s) {
      s.addEventListener('click', function() {
        seg.querySelectorAll('span').forEach(function(x) { x.classList.remove('active'); });
        s.classList.add('active');
      });
    });
  });

  document.querySelectorAll('.toggle').forEach(function(tog) {
    tog.addEventListener('click', function() { tog.classList.toggle('on'); });
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

  // ===== 实名激活 =====
  var realnameBtn = document.getElementById('btnRealname');
  if (realnameBtn) {
    realnameBtn.addEventListener('click', function() { window.open('https://eca.189.cn/', '_blank'); });
  }

  if (btnAddDevice && addDeviceSheet) {
    btnAddDevice.addEventListener('click', function() { openSheet(addDeviceSheet); });
  }

  var addDeviceClose = document.getElementById('addDeviceClose');
  if (addDeviceClose) addDeviceClose.addEventListener('click', closeSheet);

  var snInputClose = document.getElementById('snInputClose');
  if (snInputClose) snInputClose.addEventListener('click', function() {
    closeSheet();
    // 返回添加设备选择页
    if (addDeviceSheet) setTimeout(function() { openSheet(addDeviceSheet); }, 350);
  });

  // 扫码添加
  var adoQr = document.getElementById('adoQr');
  if (adoQr) {
    adoQr.addEventListener('click', function() {
      closeSheet();
      MiFiUI.showToast('正在启动扫码…');
    });
  }

  // SN 码添加 → 打开 SN 输入页
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

  // 确认 SN 添加
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
      // 模拟添加
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

  // 监听设备切换（跨页面同步）
  window.onDeviceChanged = function(dev) {
    applyAllStates();
    renderMyDevices();
  };
})();
