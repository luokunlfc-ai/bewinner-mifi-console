/* Be Winner MiFi · Shared State (localStorage) */
(function(global, doc) {
  'use strict';

  // ========== 设备状态 ==========
  var DEVICE_STORAGE_KEY = 'mifi_devices';
  var CURRENT_KEY = 'mifi_current_device_id';

  var DEFAULT_DEVICES = [
    { id: 'bwx9', model: 'BW-X9 Pro', name: '', type: 'bonding', sn: 'BWX9-2026-00128', online: true,  wifiConnected: true  },
    { id: 'bwx7', model: 'BW-X7',     name: '', type: 'mifi',    sn: 'BWX7-2025-04412', online: true,  wifiConnected: true  },
    { id: 'bwn7', model: 'BW-N7',     name: '', type: 'mifi',    sn: 'BWN7-2025-00076', online: false, wifiConnected: false }
  ];

  var SSID_MAP = {
    'bwx9': 'BW-X9_5G',
    'bwx7': 'BW-X7_5G',
    'bwn7': 'BW-N7_5G'
  };

  function loadDevices() {
    try {
      var raw = localStorage.getItem(DEVICE_STORAGE_KEY);
      if (raw !== null) { var arr = JSON.parse(raw); if (Array.isArray(arr)) return arr; }
    } catch(e) {}
    // 首次访问，初始化默认设备并存入 localStorage
    var defs = JSON.parse(JSON.stringify(DEFAULT_DEVICES));
    saveDevices(defs);
    return defs;
  }

  function saveDevices(arr) {
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(arr));
  }

  function getAllDevices() {
    return loadDevices();
  }

  function getCurrentDevice() {
    var devices = loadDevices();
    if (devices.length === 0) return null;
    var id = localStorage.getItem(CURRENT_KEY);
    var found = devices.find(function(d) { return d.id === id; });
    return found || devices[0];
  }

  function setCurrentDevice(id) {
    var devices = loadDevices();
    var dev = devices.find(function(d) { return d.id === id; });
    if (dev) {
      localStorage.setItem(CURRENT_KEY, id);
    }
    return dev || devices[0] || null;
  }

  function isBondingDevice() {
    var dev = getCurrentDevice();
    return dev && dev.type === 'bonding';
  }

  function isWifiConnected() {
    var dev = getCurrentDevice();
    // wifiConnected 字段不存在时默认为 true（向后兼容旧缓存）
    return dev ? dev.wifiConnected !== false : false;
  }

  function getDisplayName(dev) {
    return (dev && dev.name) ? dev.name : (dev ? dev.model : '');
  }

  function renameDevice(id, newName) {
    var devices = loadDevices();
    var dev = devices.find(function(d) { return d.id === id; });
    if (!dev) return false;
    dev.name = newName.trim();
    saveDevices(devices);
    return true;
  }

  function getSsid(deviceId) {
    return SSID_MAP[deviceId] || 'BW-MiFi_5G';
  }

  function addDeviceFromSn(sn) {
    var devices = loadDevices();
    // 根据SN推断型号
    var model, type;
    if (sn.toUpperCase().indexOf('X9') >= 0) { model = 'BW-X9 Pro'; type = 'bonding'; }
    else if (sn.toUpperCase().indexOf('X7') >= 0) { model = 'BW-X7'; type = 'mifi'; }
    else { model = 'BW-MiFi'; type = 'mifi'; }
    var id = 'bw_' + Date.now();
    var newDevice = { id: id, model: model, name: '', type: type, sn: sn, online: true };
    SSID_MAP[id] = 'BW-MiFi_5G';
    devices.push(newDevice);
    saveDevices(devices);
    localStorage.setItem(CURRENT_KEY, id);
    return newDevice;
  }

  function resetToDefaultDevices() {
    var defs = JSON.parse(JSON.stringify(DEFAULT_DEVICES));
    saveDevices(defs);
    localStorage.setItem(CURRENT_KEY, DEFAULT_DEVICES[0].id);
    return defs;
  }

  function removeDevice(id) {
    var devices = loadDevices();
    var idx = -1;
    for (var i = 0; i < devices.length; i++) {
      if (devices[i].id === id) { idx = i; break; }
    }
    if (idx < 0) return false;
    devices.splice(idx, 1);
    saveDevices(devices);
    // 如果删除的是当前设备，切换到第一个
    if (localStorage.getItem(CURRENT_KEY) === id) {
      if (devices.length > 0) {
        localStorage.setItem(CURRENT_KEY, devices[0].id);
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    }
    return true;
  }

  function sortDrawerItems(sheetSelector) {
    var sheet = doc.querySelector(sheetSelector);
    if (!sheet) return;
    var list = sheet.querySelector('ul');
    if (!list) return;
    var cur = getCurrentDevice();
    var currentId = cur ? cur.id : '';
    var items = Array.from(list.querySelectorAll('.dev-item'));
    items.sort(function(a, b) {
      if (a.dataset.deviceId === currentId) return -1;
      if (b.dataset.deviceId === currentId) return 1;
      return 0;
    });
    items.forEach(function(item) { list.appendChild(item); });
  }

  global.addEventListener('storage', function(e) {
    if ((e.key === CURRENT_KEY || e.key === DEVICE_STORAGE_KEY) && global.onDeviceChanged) {
      global.onDeviceChanged(getCurrentDevice());
    }
  });

  global.MiFiDevice = {
    getAll: getAllDevices,
    getCurrent: getCurrentDevice,
    setCurrent: setCurrentDevice,
    isBonding: isBondingDevice,
    isWifiConnected: isWifiConnected,
    getDisplayName: getDisplayName,
    renameDevice: renameDevice,
    getSsid: getSsid,
    addDeviceFromSn: addDeviceFromSn,
    resetToDefaultDevices: resetToDefaultDevices,
    removeDevice: removeDevice,
    sortDrawerItems: sortDrawerItems,
    CURRENT_KEY: CURRENT_KEY
  };

  // ========== 用户状态 ==========
  var USER_KEY  = 'mifi_user_info';
  var LOGIN_KEY = 'mifi_user_logged_in';
  var PLAN_KEY  = 'mifi_plan_purchased';
  var FW_KEY    = 'mifi_fw_has_update';

  function isLoggedIn() {
    return localStorage.getItem(LOGIN_KEY) === '1';
  }

  function setLoggedIn(v) {
    if (v) { localStorage.setItem(LOGIN_KEY, '1'); }
    else   { localStorage.removeItem(LOGIN_KEY); localStorage.removeItem(USER_KEY); }
  }

  function getUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : getDefaultUser();
    } catch(e) { return getDefaultUser(); }
  }

  function getDefaultUser() {
    return { phone: '138****8888', nickname: '主播小王', avatar: '👤' };
  }

  function saveUser(u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }

  function register(phone, password) {
    var u = { phone: phone, nickname: '用户' + phone.slice(-4), avatar: '👤' };
    saveUser(u);
    setLoggedIn(true);
    return u;
  }

  function login(phone) {
    var existing = getUser();
    if (existing.phone !== phone) {
      existing.phone = phone;
      existing.nickname = '用户' + phone.slice(-4);
    }
    saveUser(existing);
    setLoggedIn(true);
    return existing;
  }

  function logout() {
    setLoggedIn(false);
  }

  function updateProfile(obj) {
    var u = getUser();
    if (obj.nickname) u.nickname = obj.nickname;
    if (obj.avatar)   u.avatar   = obj.avatar;
    if (obj.phone)    u.phone    = obj.phone;
    saveUser(u);
    return u;
  }

  // isDeviceBound 现在基于设备列表是否为空
  function isDeviceBound() {
    return loadDevices().length > 0;
  }

  // 各设备套餐订购状态默认值（原型 mock）：X9 默认无套餐（首页演示无套餐红色横幅），
  // X7 已订购（保留流量套餐数据演示），N7 无套餐。
  // localStorage PLAN_KEY 为全局覆盖（联调时 MiFiUser.setPlanPurchased(true/false) 切换）
  var PLAN_DEFAULT_MAP = { bwx9: false, bwx7: true, bwn7: false };

  function isPlanPurchased() {
    var v = localStorage.getItem(PLAN_KEY);
    if (v !== null) return v === '1';
    var dev = getCurrentDevice();
    if (dev && Object.prototype.hasOwnProperty.call(PLAN_DEFAULT_MAP, dev.id)) {
      return PLAN_DEFAULT_MAP[dev.id];
    }
    return true;
  }

  function setPlanPurchased(v) {
    localStorage.setItem(PLAN_KEY, v ? '1' : '0');
  }

  function hasFwUpdate() {
    var v = localStorage.getItem(FW_KEY);
    return v === null ? true : v === '1';
  }

  function setFwUpdate(v) {
    localStorage.setItem(FW_KEY, v ? '1' : '0');
  }

  global.MiFiUser = {
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    register: register,
    getUser: getUser,
    updateProfile: updateProfile,
    isDeviceBound: isDeviceBound,
    isPlanPurchased: isPlanPurchased,
    setPlanPurchased: setPlanPurchased,
    hasFwUpdate: hasFwUpdate,
    setFwUpdate: setFwUpdate
  };

  // ========== SIM 卡状态（聚合设备子卡速率） ==========
  var SIM_CARDS_KEY = 'mifi_sim_cards';

  var DEFAULT_SIM_CARDS = [
    { id: 'mob', name: '移动', type: 'builtin', inserted: true },
    { id: 'tel', name: '电信', type: 'builtin', inserted: true },
    { id: 'ext1', name: '外置卡1', type: 'external', inserted: true },
    { id: 'ext2', name: '外置卡2', type: 'external', inserted: false },
    { id: 'usb', name: 'USB网卡', type: 'external', inserted: true } // 第三路：插入即默认聚合，不参与链路A/B切换
  ];

  function getSimCards() {
    try {
      var raw = localStorage.getItem(SIM_CARDS_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    var defs = JSON.parse(JSON.stringify(DEFAULT_SIM_CARDS));
    saveSimCards(defs);
    return defs;
  }

  function saveSimCards(cards) {
    localStorage.setItem(SIM_CARDS_KEY, JSON.stringify(cards));
  }

  function getActiveSimCards() {
    return getSimCards().filter(function(c) { return c.inserted; });
  }

  function setSimCardInserted(cardId, inserted) {
    var cards = getSimCards();
    var card = cards.find(function(c) { return c.id === cardId; });
    if (card) { card.inserted = inserted; saveSimCards(cards); }
  }

  global.MiFiSim = {
    getAll: getSimCards,
    getActive: getActiveSimCards,
    setInserted: setSimCardInserted
  };

  // ========== 聚合链路状态（换卡组合 + 卡实名状态，跨页共享） ==========
  var SLOT_CARDS_KEY   = 'mifi_slot_cards';       // {1:'移动',2:'电信'}
  var VERIFIED_KEY     = 'mifi_card_verified';    // {卡名: bool} 覆盖默认值
  var AUTHED_KEY       = 'mifi_card_authed';      // {卡名: bool} 二次认证覆盖默认值
  var DEFAULT_CARD_KEY = 'mifi_default_card';     // 数据卡管理选择的默认上网卡
  var AUTH_EXPIRY_KEY  = 'mifi_card_auth_expiry'; // {卡名: 二次认证剩余天数}

  // 卡元数据：实名/二次认证状态归属"卡"而非链路（原型中移动/电信默认均未实名、未二次认证）
  // 联调时模拟认证完成：MiFiBond.setVerified('电信', true) / MiFiBond.setAuthed('电信', true)
  var BOND_CARD_META = {
    '移动':    { carrier: 'mob', net: '· 5G', verified: false, authed: false, builtin: true },
    '电信':    { carrier: 'tel', net: '· 5G', verified: false, authed: false, builtin: true },
    '外置卡1': { carrier: 'ext', net: '· 5G', verified: true, authed: true },
    '外置卡2': { carrier: 'ext', net: '· 5G', verified: true, authed: true },
    'USB网卡': { carrier: 'ext', net: '· 5G', verified: true, authed: true }
  };

  // 各运营商实名认证入口（占位地址）
  var REALNAME_URL = {
    '电信': 'https://eca.189.cn/',
    '移动': 'https://www.10086.cn/'
  };

  // 各运营商二次实人认证入口（占位地址，工信部要求，按卡认证）
  var DEV_AUTH_URL = {
    '电信': 'https://eca.189.cn/',
    '移动': 'https://www.10086.cn/'
  };

  function getBondMeta(name) {
    return BOND_CARD_META[name] || { carrier: 'ext', net: '· 5G', verified: true };
  }

  function loadVerifiedOverrides() {
    try {
      var raw = localStorage.getItem(VERIFIED_KEY);
      if (raw) { var obj = JSON.parse(raw); if (obj && typeof obj === 'object') return obj; }
    } catch(e) {}
    return {};
  }

  function isCardVerified(name) {
    var overrides = loadVerifiedOverrides();
    if (Object.prototype.hasOwnProperty.call(overrides, name)) return !!overrides[name];
    return getBondMeta(name).verified !== false;
  }

  function setCardVerified(name, v) {
    var overrides = loadVerifiedOverrides();
    overrides[name] = !!v;
    localStorage.setItem(VERIFIED_KEY, JSON.stringify(overrides));
  }

  function getSlotCards() {
    try {
      var raw = localStorage.getItem(SLOT_CARDS_KEY);
      if (raw) {
        var obj = JSON.parse(raw);
        if (obj && obj['1'] && obj['2']) return obj;
      }
    } catch(e) {}
    return { '1': '移动', '2': '电信' };
  }

  function setSlotCard(slot, cardName) {
    var cards = getSlotCards();
    cards[String(slot)] = cardName;
    localStorage.setItem(SLOT_CARDS_KEY, JSON.stringify(cards));
  }

  // 未实名的内置卡（首页横幅 / 数据卡管理实名按钮用）
  function getUnverifiedBuiltin() {
    var result = [];
    Object.keys(BOND_CARD_META).forEach(function(name) {
      if (BOND_CARD_META[name].builtin && !isCardVerified(name)) result.push(name);
    });
    return result;
  }

  // ---- 二次实人认证（卡级，与实名相互独立） ----
  function loadAuthedOverrides() {
    try {
      var raw = localStorage.getItem(AUTHED_KEY);
      if (raw) { var obj = JSON.parse(raw); if (obj && typeof obj === 'object') return obj; }
    } catch(e) {}
    return {};
  }

  function isCardAuthed(name) {
    var overrides = loadAuthedOverrides();
    if (Object.prototype.hasOwnProperty.call(overrides, name)) return !!overrides[name];
    return getBondMeta(name).authed !== false;
  }

  function setCardAuthed(name, v) {
    var overrides = loadAuthedOverrides();
    overrides[name] = !!v;
    localStorage.setItem(AUTHED_KEY, JSON.stringify(overrides));
  }

  // 未二次认证的内置卡（首页横幅 / 二次认证管理用）
  function getUnauthedBuiltin() {
    var result = [];
    Object.keys(BOND_CARD_META).forEach(function(name) {
      if (BOND_CARD_META[name].builtin && !isCardAuthed(name)) result.push(name);
    });
    return result;
  }

  // ---- 默认上网卡（数据卡管理选择，持久化） ----
  function getDefaultCard() {
    return localStorage.getItem(DEFAULT_CARD_KEY) || '移动';
  }

  function setDefaultCard(name) {
    localStorage.setItem(DEFAULT_CARD_KEY, name);
  }

  // ---- 二次认证有效期（剩余天数，联调模拟用） ----
  // 演示临期提醒：MiFiBond.setAuthed('电信', true); MiFiBond.setAuthExpiry('电信', 2)
  function loadAuthExpiry() {
    try {
      var raw = localStorage.getItem(AUTH_EXPIRY_KEY);
      if (raw) { var obj = JSON.parse(raw); if (obj && typeof obj === 'object') return obj; }
    } catch(e) {}
    return {};
  }

  function getAuthExpiry(name) {
    var map = loadAuthExpiry();
    return Object.prototype.hasOwnProperty.call(map, name) ? map[name] : null;
  }

  function setAuthExpiry(name, days) {
    var map = loadAuthExpiry();
    if (days === null || days === undefined) { delete map[name]; }
    else { map[name] = days; }
    localStorage.setItem(AUTH_EXPIRY_KEY, JSON.stringify(map));
  }

  // ---- 首页横幅关注卡：实际承担上网的卡 ----
  // （数据卡管理默认上网卡 ∪ 聚合链路 A/B 网卡）∩ 移动/电信内置卡
  // 默认卡与链路均为外置卡时返回空数组 → 实名/无套餐/二次认证横幅均不弹
  function getWatchCards() {
    var set = {};
    function add(name) {
      if (BOND_CARD_META[name] && BOND_CARD_META[name].builtin) set[name] = true;
    }
    add(getDefaultCard());
    var slots = getSlotCards();
    add(slots['1']);
    add(slots['2']);
    return ['移动', '电信'].filter(function(name) { return set[name]; });
  }

  global.MiFiBond = {
    getMeta: getBondMeta,
    isVerified: isCardVerified,
    setVerified: setCardVerified,
    isAuthed: isCardAuthed,
    setAuthed: setCardAuthed,
    getAuthExpiry: getAuthExpiry,
    setAuthExpiry: setAuthExpiry,
    getSlotCards: getSlotCards,
    setSlotCard: setSlotCard,
    getDefaultCard: getDefaultCard,
    setDefaultCard: setDefaultCard,
    getWatchCards: getWatchCards,
    getUnverifiedBuiltin: getUnverifiedBuiltin,
    getUnauthedBuiltin: getUnauthedBuiltin,
    REALNAME_URL: REALNAME_URL,
    DEV_AUTH_URL: DEV_AUTH_URL
  };

  // ========== UI 工具 ==========
  var toastTimer = null;
  var toastEl = null;

  function showToast(msg, duration) {
    if (!toastEl) {
      toastEl = doc.createElement('div');
      toastEl.className = 'mifi-toast';
      doc.body.appendChild(toastEl);
    }
    if (toastTimer) clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(function() {
      toastEl.classList.remove('show');
    }, duration || 2000);
  }

  global.MiFiUI = {
    showToast: showToast
  };

  // ========== 登录保护 ==========
  var currentPage = (function() {
    var path = global.location.pathname;
    var name = path.substring(path.lastIndexOf('/') + 1);
    return name || 'index.html';
  })();

  if (currentPage !== 'login.html' && currentPage !== '') {
    if (!isLoggedIn()) {
      global.location.href = 'login.html';
    }
  }

})(window, document);
