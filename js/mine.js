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
    renderDataCardStates();
    openSheet(dataCardSheet);
  });

  if (dataCardSheet) {
    dataCardSheet.querySelectorAll('.card-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        dataCardSheet.querySelectorAll('.card-option').forEach(function (o) { o.classList.remove('active'); });
        opt.classList.add('active');
        if (curCardEl) curCardEl.textContent = opt.dataset.card;
        MiFiBond.setDefaultCard(opt.dataset.card); // 持久化默认上网卡，首页横幅按此评估
        setTimeout(closeSheet, 200);
      });
    });
  }

  // 默认上网卡持久化状态回显（菜单副标题 + 抽屉选中项）
  function syncDefaultCardUI() {
    var name = MiFiBond.getDefaultCard();
    if (curCardEl) curCardEl.textContent = name;
    if (dataCardSheet) {
      dataCardSheet.querySelectorAll('.card-option').forEach(function (o) {
        o.classList.toggle('active', o.dataset.card === name);
      });
    }
  }
  syncDefaultCardUI();

  // === 数据卡管理：内置卡实名状态（副标题 + 去实名按钮） ===
  function renderDataCardStates() {
    if (!dataCardSheet) return;
    ['移动', '电信'].forEach(function (name) {
      var opt = dataCardSheet.querySelector('.card-option[data-card="' + name + '"]');
      if (!opt) return;
      var verified = MiFiBond.isVerified(name);
      var sub = opt.querySelector('.co-main span');
      if (sub) sub.textContent = '内置卡 · 5G · ' + (verified ? '已实名' : '未实名');
      var btn = opt.querySelector('.co-rn-btn');
      if (btn) btn.style.display = verified ? 'none' : '';
    });
  }

  // 去实名按钮：不触发选中，直接跳运营商认证页
  if (dataCardSheet) {
    dataCardSheet.querySelectorAll('.co-rn-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var url = MiFiBond.REALNAME_URL[btn.dataset.card] || 'https://eca.189.cn/';
        window.open(url, '_blank');
      });
    });
  }

  // === 聚合链路管理（仅聚合设备可见） ===
  var btnBondLink = document.getElementById('btnBondLink');
  var bondLinkSub = document.getElementById('bondLinkSub');
  var bondLinkSheet = document.getElementById('bondLinkSheet');
  var bondCardSheet = document.getElementById('bondCardSheet');
  var bondSheetTitle = document.getElementById('bondSheetTitle');
  var bondCardHint = document.getElementById('bondCardHint');
  var pendingBondSlot = null;

  // 网卡分组：同组卡共享同一物理 Modem，两条链路不可同时使用同组卡
  var CARD_GROUP = {
    '移动': 'A',
    '外置卡1': 'A',
    '电信': 'B',
    '外置卡2': 'B'
  };

  // 抽屉选项副标题（未插入时追加标注）
  var CARD_SUBTITLE = {
    '移动': '内置卡 · 5G',
    '电信': '内置卡 · 5G',
    '外置卡1': '外置插拔卡',
    '外置卡2': '外置插拔卡'
  };

  function getSimInsertedMap() {
    var map = {};
    MiFiSim.getAll().forEach(function (c) { map[c.name] = c.inserted !== false; });
    return map;
  }

  // 入口显隐 + 副标题（当前链路组合）
  function updateBondLinkEntry() {
    if (!btnBondLink) return;
    var dev = MiFiDevice.getCurrent();
    var isBonding = dev && dev.type === 'bonding';
    btnBondLink.style.display = isBonding ? '' : 'none';
    if (isBonding && bondLinkSub) {
      var slots = MiFiBond.getSlotCards();
      bondLinkSub.textContent = slots['1'] + ' + ' + slots['2'] + ' + USB网卡';
    }
  }

  function renderBondLinkRow(slot) {
    var row = document.getElementById('slot' + slot);
    if (!row) return;
    var cardName = MiFiBond.getSlotCards()[slot];
    var meta = MiFiBond.getMeta(cardName);
    var verified = MiFiBond.isVerified(cardName);

    row.dataset.carrier = meta.carrier;
    var ico = document.getElementById('slot' + slot + 'Ico');
    if (ico) ico.className = 'bn-slot-ico ' + meta.carrier;
    var nameEl = document.getElementById('slot' + slot + 'Name');
    if (nameEl) nameEl.textContent = cardName;
    var netEl = document.getElementById('slot' + slot + 'Net');
    if (netEl) netEl.textContent = meta.net;

    // SIM 插拔状态（未插入的卡不应出现在链路上，此处为防御性处理）
    var insertedMap = getSimInsertedMap();
    var inserted = insertedMap[cardName] !== false;

    row.classList.toggle('unverified', inserted && !verified);

    // 行内三态元素（预置节点 display 切换，不重建 DOM）：
    // 信号格：已实名（或未插入的防御态）时显示；未实名 → 隐藏信号格，换为「去实名」按钮
    var bars = document.getElementById('slot' + slot + 'Bars');
    var rnTag = document.getElementById('slot' + slot + 'RnTag');
    var rnBtn = document.getElementById('slot' + slot + 'RnBtn');
    if (bars) bars.style.display = (verified || !inserted) ? '' : 'none';
    if (rnTag) rnTag.style.display = verified ? '' : 'none';
    if (rnBtn) rnBtn.style.display = (inserted && !verified) ? '' : 'none';

    // 未插入：信号格全部灰显
    if (bars) {
      bars.querySelectorAll('i').forEach(function (el) { el.classList.toggle('off', !inserted); });
    }
  }

  if (btnBondLink && bondLinkSheet) {
    btnBondLink.addEventListener('click', function () {
      if (!requireDevice()) return;
      renderBondLinkRow('1');
      renderBondLinkRow('2');
      openSheet(bondLinkSheet);
    });
  }

  // 链路行内 去实名 按钮（事件委托，按链路当前卡跳转对应运营商）
  if (bondLinkSheet) {
    bondLinkSheet.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.realname-btn') : null;
      if (!btn) return;
      var row = btn.closest('.link-row');
      var slot = row ? row.dataset.slot : null;
      var cardName = slot ? MiFiBond.getSlotCards()[slot] : '电信';
      window.open(MiFiBond.REALNAME_URL[cardName] || 'https://eca.189.cn/', '_blank');
    });

    // 更换 › → 打开选卡抽屉
    bondLinkSheet.querySelectorAll('.link-change').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pendingBondSlot = btn.dataset.slot;
        if (bondSheetTitle) bondSheetTitle.textContent = '选择链路 ' + (pendingBondSlot === '1' ? 'A' : 'B') + ' 网卡';
        var slots = MiFiBond.getSlotCards();
        var curName = slots[pendingBondSlot];
        var otherCard = slots[pendingBondSlot === '1' ? '2' : '1'];
        var otherGroup = CARD_GROUP[otherCard] || '';
        var insertedMap = getSimInsertedMap();
        var hasUninserted = false;

        // 更新各选项状态
        bondCardSheet.querySelectorAll('.card-option').forEach(function (opt) {
          var cardName = opt.dataset.card;
          opt.classList.toggle('active', cardName === curName);
          var inserted = insertedMap[cardName] !== false;
          var sub = opt.querySelector('.co-main span');
          if (sub) sub.textContent = CARD_SUBTITLE[cardName] + (inserted ? '' : ' · 未插入');
          // 禁用：未插入的卡，或与另一链路同组的卡
          if (!inserted || (otherGroup && CARD_GROUP[cardName] === otherGroup && cardName !== curName)) {
            opt.classList.add('disabled');
            if (!inserted) hasUninserted = true;
          } else {
            opt.classList.remove('disabled');
          }
        });

        // 提示文字：同组互斥优先，其次未插入提示
        if (bondCardHint) {
          if (otherGroup) {
            var groupCards = otherGroup === 'A' ? '移动 / 外置卡1' : '电信 / 外置卡2';
            bondCardHint.textContent = '链路 ' + (pendingBondSlot === '1' ? 'B' : 'A') + ' 已占用 ' + groupCards + ' 组，同组卡不可重复选择';
            bondCardHint.style.display = '';
          } else if (hasUninserted) {
            bondCardHint.textContent = '灰色选项为未插入的外置卡，插入设备后再选择';
            bondCardHint.style.display = '';
          } else {
            bondCardHint.style.display = 'none';
          }
        }

        openSheet(bondCardSheet);
      });
    });
  }

  // 选卡抽屉：选中 → 更新状态 → 回到链路管理抽屉
  if (bondCardSheet) {
    bondCardSheet.querySelectorAll('.card-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        if (!pendingBondSlot) return;
        if (opt.classList.contains('disabled')) return;
        var cardName = opt.dataset.card;
        MiFiBond.setSlotCard(pendingBondSlot, cardName);
        renderBondLinkRow(pendingBondSlot);
        updateBondLinkEntry();
        closeSheet();
        MiFiUI.showToast('链路 ' + (pendingBondSlot === '1' ? 'A' : 'B') + ' 已切换为 ' + cardName);
        // 回到链路管理抽屉，展示更新后的组合
        setTimeout(function () {
          renderBondLinkRow('1');
          renderBondLinkRow('2');
          openSheet(bondLinkSheet);
        }, 350);
      });
    });
  }

  updateBondLinkEntry();

  // === 二次认证管理（抽屉逐卡认证，与首页二次认证横幅同源） ===
  var btnDevAuth = document.getElementById('btnDevAuth');
  var devAuthSheet = document.getElementById('devAuthSheet');
  var devAuthList = document.getElementById('devAuthList');
  var devAuthClose = document.getElementById('devAuthClose');
  if (devAuthClose) devAuthClose.addEventListener('click', closeSheet);

  // 逐卡展示二次认证状态，未认证的卡给出去认证入口
  function renderDevAuthList() {
    if (!devAuthList) return;
    devAuthList.innerHTML = '';
    ['移动', '电信'].forEach(function (name) {
      var meta = MiFiBond.getMeta(name);
      var authed = MiFiBond.isAuthed(name);
      var expiry = authed ? MiFiBond.getAuthExpiry(name) : null;
      var statusText = authed
        ? '已二次认证' + (expiry !== null ? ' · 剩余 ' + expiry + ' 天到期' : '')
        : '未二次认证';
      var li = document.createElement('li');
      li.className = 'rn-info-item';
      li.innerHTML = '<span class="rn-info-ico ' + meta.carrier + '"></span>'
        + '<div class="rn-info-main"><b>' + name + '</b>'
        + '<span>内置卡 ' + meta.net + ' · ' + statusText + '</span></div>'
        + (authed
            ? '<span class="realname-tag done">已认证</span>'
            : '<button class="rn-info-btn" type="button">去认证</button>');
      var btn = li.querySelector('.rn-info-btn');
      if (btn) {
        btn.addEventListener('click', function () {
          window.open(MiFiBond.DEV_AUTH_URL[name] || 'https://eca.189.cn/', '_blank');
        });
      }
      devAuthList.appendChild(li);
    });
  }

  if (btnDevAuth && devAuthSheet) {
    btnDevAuth.addEventListener('click', function () {
      if (!requireDevice()) return;
      renderDevAuthList();
      openSheet(devAuthSheet);
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
          // 已展开状态下轻触 → 关闭
          closeSwipe();
        }
      }

      // 触屏
      item.addEventListener('touchstart', function(e) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      item.addEventListener('touchmove', function(e) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      item.addEventListener('touchend', function(e) {
        onEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      });

      // 鼠标
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

    // 切换按钮
    myDevicesList.querySelectorAll('.mdi-switch-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeSwipe();
        var deviceId = btn.dataset.deviceId;
        MiFiDevice.setCurrent(deviceId);
        closeSheet();
        MiFiUI.showToast('已切换设备');
        updateBondLinkEntry();
        updateDeviceSubtitle();
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
