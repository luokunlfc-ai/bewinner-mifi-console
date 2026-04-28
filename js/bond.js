/* Be Winner MiFi · 聚合管理页交互 */

(function () {
  // === 实时速率滚动 ===
  var bondDown = document.getElementById('bondDown');
  var bondUp   = document.getElementById('bondUp');
  var mobDown  = document.getElementById('mobDown');
  var mobUp    = document.getElementById('mobUp');
  var telDown  = document.getElementById('telDown');
  var telUp    = document.getElementById('telUp');

  if (bondDown) {
    setInterval(function () {
      var dTotal = 80 + Math.random() * 80;
      var uTotal = 25 + Math.random() * 30;
      var dRatio = 0.45 + Math.random() * 0.2;
      var uRatio = 0.45 + Math.random() * 0.2;

      bondDown.textContent = dTotal.toFixed(1);
      bondUp.textContent   = uTotal.toFixed(1);
      mobDown.textContent  = (dTotal * dRatio).toFixed(1);
      mobUp.textContent    = (uTotal * uRatio).toFixed(1);
      telDown.textContent  = (dTotal * (1 - dRatio)).toFixed(1);
      telUp.textContent    = (uTotal * (1 - uRatio)).toFixed(1);
    }, 1500);
  }

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

  // === 网卡选择抽屉 ===
  var cardSheet  = document.getElementById('cardSheet');
  var sheetTitle = document.getElementById('sheetTitle');
  var sheetClose = document.getElementById('sheetClose');
  var slot1Name  = document.getElementById('slot1Name');
  var slot2Name  = document.getElementById('slot2Name');
  var currentSlot = null;

  var slotValues = { '1': '移动', '2': '电信' };
  var icoMap = { '移动': 'mob', '电信': 'tel', '外置卡1': 'ext', '外置卡2': 'ext' };

  function refreshChecks() {
    document.querySelectorAll('.card-option').forEach(function (opt) {
      var card = opt.dataset.card;
      var isActive = (card === slotValues[currentSlot]);
      opt.classList.toggle('active', isActive);
    });
  }

  function updateSlotUI(slotNum) {
    var name = slotValues[slotNum];
    var nameEl = document.getElementById('slot' + slotNum + 'Name');
    var slotEl = document.getElementById('slot' + slotNum);
    if (nameEl) nameEl.textContent = name;
    var ico = slotEl.querySelector('.bn-slot-ico');
    if (ico) { ico.className = 'bn-slot-ico ' + (icoMap[name] || 'ext'); }
  }

  document.querySelectorAll('.bn-slot-change').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentSlot = btn.dataset.slot;
      sheetTitle.textContent = '选择链路 ' + (currentSlot === '1' ? 'A' : 'B') + ' 网卡';
      refreshChecks();
      openSheet(cardSheet);
    });
  });

  document.querySelectorAll('.card-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      var card = opt.dataset.card;
      var otherSlot = currentSlot === '1' ? '2' : '1';
      if (slotValues[otherSlot] === card) return;
      slotValues[currentSlot] = card;
      updateSlotUI(currentSlot);
      refreshChecks();
      setTimeout(closeSheet, 200);
    });
  });

  if (sheetClose) sheetClose.addEventListener('click', closeSheet);

  // === Tabbar ===
  document.querySelectorAll('.tabbar .tab').forEach(function (t) {
    t.addEventListener('click', function () {
      if (t.getAttribute('href')) return;
      document.querySelectorAll('.tabbar .tab').forEach(function (x) { x.classList.remove('active'); });
      if (!t.classList.contains('center')) t.classList.add('active');
    });
  });
})();
