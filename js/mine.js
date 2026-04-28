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

  // === 账号管理 ===
  var accountSheet = document.getElementById('accountSheet');
  var btnAccount = document.getElementById('btnAccount');
  var btnEditProfile = document.getElementById('btnEditProfile');
  if (btnAccount) btnAccount.addEventListener('click', function () { openSheet(accountSheet); });
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

  // === 数据卡管理 ===
  var dataCardSheet = document.getElementById('dataCardSheet');
  var btnDataCard = document.getElementById('btnDataCard');
  var curCardEl = document.getElementById('curCard');
  if (btnDataCard) btnDataCard.addEventListener('click', function () { openSheet(dataCardSheet); });

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

  // === 固件升级 ===
  var fwSheet = document.getElementById('fwSheet');
  var btnFirmware = document.getElementById('btnFirmware');
  var fwUpdateBtn = document.getElementById('fwUpdateBtn');
  var fwBadge = document.getElementById('fwBadge');
  if (btnFirmware) btnFirmware.addEventListener('click', function () { openSheet(fwSheet); });

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
          if (fwBadge) fwBadge.style.display = 'none';
          var fwVer = document.getElementById('fwVer');
          if (fwVer) fwVer.textContent = 'v2.5.0';
          setTimeout(function () {
            fwUpdateBtn.textContent = '已是最新版本';
            fwUpdateBtn.disabled = true;
            fwUpdateBtn.style.background = '#d1d5db';
          }, 1200);
        } else {
          fwUpdateBtn.textContent = '升级中 ' + Math.min(Math.round(progress), 99) + '%…';
        }
      }, 400);
    });
  }

  // === 网络诊断 ===
  var diagSheet = document.getElementById('diagSheet');
  var btnDiag = document.getElementById('btnDiag');
  var diagStart = document.getElementById('diagStart');
  if (btnDiag) btnDiag.addEventListener('click', function () { openSheet(diagSheet); });

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

  // === Tabbar ===
  document.querySelectorAll('.tabbar .tab').forEach(function (t) {
    t.addEventListener('click', function () {
      if (t.getAttribute('href')) return;
      document.querySelectorAll('.tabbar .tab').forEach(function (x) { x.classList.remove('active'); });
      if (!t.classList.contains('center')) t.classList.add('active');
    });
  });
})();
