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

  function isPlanPurchased() {
    // N7 设备始终展示无套餐状态
    var dev = getCurrentDevice();
    if (dev && dev.id === 'bwn7') return false;
    var v = localStorage.getItem(PLAN_KEY);
    return v === null ? true : v === '1';
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
    { id: 'ext2', name: '外置卡2', type: 'external', inserted: false }
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
