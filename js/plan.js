/* Be Winner MiFi · 套餐管理页交互 */

(function () {
  // === 主状态应用 ===
  function applyAllStates() {
    var hasDevice = MiFiUser.isDeviceBound();
    var hasPlan = MiFiUser.isPlanPurchased();
    var dev = MiFiDevice.getCurrent();
    var isBonding = dev ? dev.type === 'bonding' : false;

    var emptyDevice = document.getElementById('emptyDevice');
    var planContent = document.getElementById('planContent');
    var titleBar = document.getElementById('deviceTitleBar');

    // 无设备状态
    if (!hasDevice || !dev) {
      if (emptyDevice) emptyDevice.style.display = '';
      if (planContent) planContent.style.display = 'none';
      if (titleBar) titleBar.style.display = 'none';
      return;
    }

    if (emptyDevice) emptyDevice.style.display = 'none';
    if (planContent) planContent.style.display = '';
    if (titleBar) titleBar.style.display = '';

    // 设备标题栏
    var modelEl = document.getElementById('planDeviceModel');
    var statusEl = document.getElementById('planDeviceStatus');
    var wifiEl = document.getElementById('planDeviceWifi');
    if (modelEl) modelEl.textContent = MiFiDevice.getDisplayName(dev);
    if (statusEl) {
      if (dev.online) {
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

    // 聚合套餐项显隐
    var bondItem = document.getElementById('cpBondItem');
    var cpDivider = document.getElementById('cpDivider');
    if (bondItem) bondItem.style.display = isBonding ? '' : 'none';
    if (cpDivider) cpDivider.style.display = isBonding ? '' : 'none';

    // 聚合套餐 Tab：聚合设备排第一位，非聚合设备隐藏
    var tabsScrollEl = document.getElementById('shopTabsScroll');
    var bondTab = document.getElementById('shopTabBond');
    if (tabsScrollEl && bondTab) {
      if (isBonding) {
        bondTab.style.display = '';
        tabsScrollEl.insertBefore(bondTab, tabsScrollEl.firstChild);
        // 默认选中聚合套餐 Tab
        var activeTab = document.querySelector('.shop-tab-scroll-item.active');
        if (activeTab) activeTab.classList.remove('active');
        bondTab.classList.add('active');
        document.querySelectorAll('.shop-panel').forEach(function(p) { p.classList.remove('active'); });
        var bondPanel = document.getElementById('panelBond');
        if (bondPanel) bondPanel.classList.add('active');
      } else {
        bondTab.style.display = 'none';
        tabsScrollEl.appendChild(bondTab);
        var activeTab2 = document.querySelector('.shop-tab-scroll-item.active');
        if (activeTab2 && activeTab2.dataset.tab === 'bond') {
          activeTab2.classList.remove('active');
          var mainTab = document.querySelector('.shop-tab-scroll-item[data-tab="main"]');
          if (mainTab) mainTab.classList.add('active');
          document.querySelectorAll('.shop-panel').forEach(function(p) { p.classList.remove('active'); });
          var mainPanel = document.getElementById('panelMain');
          if (mainPanel) mainPanel.classList.add('active');
        }
      }
    }

    // 套餐订购状态
    var cpContent = document.getElementById('cpContent');
    var cpEmpty = document.getElementById('cpEmpty');
    if (hasPlan) {
      if (cpContent) cpContent.style.display = '';
      if (cpEmpty) cpEmpty.style.display = 'none';
    } else {
      if (cpContent) cpContent.style.display = 'none';
      if (cpEmpty) cpEmpty.style.display = '';
    }
  }

  // === Sheet 管理 ===
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

  // === 套餐列表抽屉（点击当前套餐环形图进入） ===
  // 仅展示当前卡 正使用/待生效 的套餐（原型 mock，联调时按设备+卡拉取）
  var PLAN_STATUS_META = {
    using:   { label: '正使用', cls: 'using' },
    pending: { label: '待生效', cls: 'pending' }
  };
  var PLAN_LIST_DATA = {
    flow: [
      { name: '月享100GB年包', status: 'using',   validity: '2025/11/14 至 2026/11/14', total: '80 GB',  remain: '38.2 GB' },
      { name: '月享100GB年包', status: 'pending', validity: '2026/11/14 至 2027/11/14', total: '80 GB',  remain: '80 GB' }
    ],
    bond: [
      { name: '60G聚合套餐',   status: 'using',   validity: '2026/07/01 至 2026/07/31', total: '60 GB',  remain: '12.6 GB' },
      { name: '60G聚合套餐',   status: 'pending', validity: '2026/08/01 至 2026/08/31', total: '60 GB',  remain: '60 GB' }
    ]
  };

  var planListSheet = document.getElementById('planListSheet');
  var planListTitle = document.getElementById('planListTitle');
  var planListUl = document.getElementById('planListUl');

  function renderPlanList(type) {
    if (!planListUl) return;
    if (planListTitle) planListTitle.textContent = type === 'bond' ? '聚合套餐' : '流量套餐';
    planListUl.innerHTML = '';
    (PLAN_LIST_DATA[type] || []).forEach(function(p) {
      var st = PLAN_STATUS_META[p.status];
      var li = document.createElement('li');
      li.className = 'pl-item';
      li.innerHTML = '<span class="pl-status ' + st.cls + '">' + st.label + '</span>'
        + '<b class="pl-name">' + p.name + '</b>'
        + '<div class="pl-row"><span>有效期限</span><span class="mono">' + p.validity + '</span></div>'
        + '<div class="pl-row"><span>总流量</span><span class="mono">' + p.total + '</span></div>'
        + '<div class="pl-row"><span>剩余流量</span><span class="mono">' + p.remain + '</span></div>';
      planListUl.appendChild(li);
    });
  }

  var cpFlowRing = document.getElementById('cpFlowRing');
  var cpBondRing = document.getElementById('cpBondRing');
  if (cpFlowRing && planListSheet) {
    cpFlowRing.addEventListener('click', function() { renderPlanList('flow'); openSheet(planListSheet); });
  }
  if (cpBondRing && planListSheet) {
    cpBondRing.addEventListener('click', function() { renderPlanList('bond'); openSheet(planListSheet); });
  }

  // === 滑动 Tab 切换 ===
  var tabsScroll = document.getElementById('shopTabsScroll');
  var panels = document.querySelectorAll('.shop-panel');

  if (tabsScroll) {
    tabsScroll.querySelectorAll('.shop-tab-scroll-item').forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabsScroll.querySelectorAll('.shop-tab-scroll-item').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        panels.forEach(function(p) { p.classList.remove('active'); });
        var target = document.getElementById('panel' + capitalize(tab.dataset.tab));
        if (target) target.classList.add('active');
      });
    });

    // 鼠标按住拖拽滑动（桌面端原型演示用）
    var isDown = false, startX, scrollStart;
    tabsScroll.addEventListener('mousedown', function(e) {
      isDown = true;
      tabsScroll.style.cursor = 'grabbing';
      startX = e.pageX - tabsScroll.offsetLeft;
      scrollStart = tabsScroll.scrollLeft;
    });
    tabsScroll.addEventListener('mouseleave', function() {
      isDown = false;
      tabsScroll.style.cursor = '';
    });
    tabsScroll.addEventListener('mouseup', function() {
      isDown = false;
      tabsScroll.style.cursor = '';
    });
    tabsScroll.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - tabsScroll.offsetLeft;
      tabsScroll.scrollLeft = scrollStart - (x - startX);
    });
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // === 套餐卡片点击 → 支付抽屉 ===
  var paySheet = document.getElementById('paySheet');
  var payName = document.getElementById('payName');
  var payDeviceSn = document.getElementById('payDeviceSn');
  var payValidity = document.getElementById('payValidity');
  var payPrice = document.getElementById('payPrice');
  var payConfirmBtn = document.getElementById('payConfirmBtn');
  var couponVal = document.getElementById('couponVal');
  var couponRow = document.getElementById('couponRow');

  var currentCardData = null;
  var selectedCoupon = null;

  document.querySelectorAll('.shop-panel .pkg-card').forEach(function(card) {
    card.addEventListener('click', function() {
      document.querySelectorAll('.shop-panel .pkg-card').forEach(function(c) { c.classList.remove('selected'); });
      card.classList.add('selected');

      var name = card.dataset.name || card.dataset.label || '';
      var price = card.dataset.price || '0';
      var validity = card.dataset.validity || '1个月';
      var dev = MiFiDevice.getCurrent();

      currentCardData = {
        name: name,
        price: parseFloat(price),
        validity: validity,
        label: card.dataset.label || ''
      };

      if (payName) payName.textContent = name + ' · ' + (card.querySelector('.pkg-size') ? card.querySelector('.pkg-size').textContent.trim() : '');
      if (payDeviceSn) payDeviceSn.textContent = dev.sn;
      if (payValidity) payValidity.textContent = '购买后 ' + validity + ' 有效';
      if (payPrice) payPrice.textContent = '¥' + price;

      selectedCoupon = null;
      if (couponVal) {
        couponVal.textContent = '暂无可用优惠券';
        couponVal.classList.remove('active');
      }

      updatePayButton();
      openSheet(paySheet);
    });
  });

  function calcFinalPrice() {
    if (!currentCardData) return 0;
    var p = currentCardData.price;
    if (selectedCoupon) p = Math.max(0, p - selectedCoupon.discount);
    return p;
  }

  function updatePayButton() {
    if (!payConfirmBtn) return;
    var finalPrice = calcFinalPrice();
    payConfirmBtn.textContent = '确认支付 ¥' + finalPrice;
  }

  // === 支付方式切换 ===
  document.querySelectorAll('.pay-method-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.pay-method-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  // === 确认支付 ===
  if (payConfirmBtn) {
    payConfirmBtn.addEventListener('click', function() {
      payConfirmBtn.textContent = '支付成功 ✓';
      payConfirmBtn.style.background = '#22c55e';
      payConfirmBtn.style.color = '#fff';
      payConfirmBtn.style.borderColor = '#22c55e';
      setTimeout(function() {
        payConfirmBtn.textContent = '确认支付 ¥' + (currentCardData ? currentCardData.price : '--');
        payConfirmBtn.style.background = '';
        payConfirmBtn.style.color = '';
        payConfirmBtn.style.borderColor = '';
        closeSheet();
        document.querySelectorAll('.shop-panel .pkg-card').forEach(function(c) { c.classList.remove('selected'); });
        currentCardData = null;
        selectedCoupon = null;
        if (couponVal) {
          couponVal.textContent = '暂无可用优惠券';
          couponVal.classList.remove('active');
        }
      }, 1000);
    });
  }

  var payClose = document.getElementById('payClose');
  if (payClose) payClose.addEventListener('click', closeSheet);

  // === 优惠券选择 ===
  var couponSheet = document.getElementById('couponSheet');
  var couponClose = document.getElementById('couponClose');

  if (couponRow && couponSheet) {
    couponRow.addEventListener('click', function() {
      openSheet(couponSheet);
    });
  }

  if (couponClose) couponClose.addEventListener('click', closeSheet);

  document.querySelectorAll('.coupon-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var discount = parseInt(item.dataset.discount);
      var label = item.dataset.label;
      var price = currentCardData ? currentCardData.price : 999;

      var minSpend = parseInt(item.querySelector('.coup-left span').textContent.replace(/[^0-9]/g, ''));
      if (price < minSpend) return;

      selectedCoupon = { discount: discount, label: label };

      document.querySelectorAll('.coupon-item').forEach(function(ci) { ci.classList.remove('selected'); });
      item.classList.add('selected');

      if (couponVal) {
        couponVal.textContent = '已选：' + label + ' (-¥' + discount + ')';
        couponVal.classList.add('active');
      }

      updatePayButton();
      setTimeout(function() {
        closeSheet();
        if (activeSheet === couponSheet) {
          setTimeout(function() { openSheet(paySheet); }, 350);
        }
      }, 200);
    });
  });

  // === 我的设备抽屉 ===
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

  // === 通用关闭按钮 ===
  document.querySelectorAll('.sheet-close').forEach(function(btn) {
    if (btn.id !== 'payClose' && btn.id !== 'couponClose') {
      btn.addEventListener('click', closeSheet);
    }
  });

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

  // === 实名认证跳转 ===
  var idBtn = document.getElementById('btnIdVerify');
  if (idBtn) {
    idBtn.addEventListener('click', function() {
      window.open(MiFiBond.REALNAME_URL['电信'] || 'https://eca.189.cn/', '_blank');
    });
  }
  var idBtnMob = document.getElementById('btnIdVerifyMob');
  if (idBtnMob) {
    idBtnMob.addEventListener('click', function() {
      window.open(MiFiBond.REALNAME_URL['移动'] || 'https://www.10086.cn/', '_blank');
    });
  }

  // === Tabbar ===
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

  // === 添加设备 ===
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

  // === 初始化 ===
  applyAllStates();
  renderMyDevices();
})();
