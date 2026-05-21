/* Be Winner MiFi · 设置页交互 */
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

  document.querySelectorAll('.sheet-close').forEach(function (btn) {
    btn.addEventListener('click', closeSheet);
  });

  // === 返回按钮 ===
  var btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', function() {
      window.location.href = 'mine.html';
    });
  }

  // === 填充当前手机号 ===
  var setPhone = document.getElementById('setPhone');
  if (setPhone) {
    var user = MiFiUser.getUser();
    setPhone.textContent = user.phone || '138****8888';
  }

  // === 更换手机号 ===
  var btnChangePhone = document.getElementById('btnChangePhone');
  var phoneSheet = document.getElementById('phoneSheet');
  var phoneSheetTitle = document.getElementById('phoneSheetTitle');
  var phoneStep1 = document.getElementById('phoneStep1');
  var phoneStep2 = document.getElementById('phoneStep2');

  // Step 1 elements
  var phoneCurPhone = document.getElementById('phoneCurPhone');
  var phoneStep1Sms = document.getElementById('phoneStep1Sms');
  var phoneStep1SmsBtn = document.getElementById('phoneStep1SmsBtn');
  var phoneStep1Btn = document.getElementById('phoneStep1Btn');
  var phoneStep1Hint = document.getElementById('phoneStep1Hint');
  var phoneStep1Timer = null;

  // Step 2 elements
  var phoneInput = document.getElementById('phoneInput');
  var smsInput = document.getElementById('smsInput');
  var smsBtn = document.getElementById('smsBtn');
  var phoneConfirmBtn = document.getElementById('phoneConfirmBtn');
  var phoneHint = document.getElementById('phoneHint');
  var smsTimer = null;

  function resetPhoneSheet() {
    // Reset step 1
    if (phoneStep1) phoneStep1.style.display = '';
    if (phoneStep2) phoneStep2.style.display = 'none';
    if (phoneSheetTitle) phoneSheetTitle.textContent = '更换手机号';
    if (phoneCurPhone) { var u = MiFiUser.getUser(); phoneCurPhone.textContent = u.phone || '138****8888'; }
    if (phoneStep1Sms) phoneStep1Sms.value = '';
    if (phoneStep1Hint) { phoneStep1Hint.textContent = ''; phoneStep1Hint.style.display = 'none'; }
    if (phoneStep1SmsBtn) { phoneStep1SmsBtn.textContent = '发送验证码'; phoneStep1SmsBtn.disabled = false; }
    if (phoneStep1Timer) { clearInterval(phoneStep1Timer); phoneStep1Timer = null; }
    if (phoneStep1Btn) { phoneStep1Btn.textContent = '下一步'; phoneStep1Btn.disabled = false; }
    // Reset step 2
    if (phoneInput) phoneInput.value = '';
    if (smsInput) smsInput.value = '';
    if (phoneHint) { phoneHint.textContent = ''; phoneHint.style.display = 'none'; }
    if (smsBtn) { smsBtn.textContent = '发送验证码'; smsBtn.disabled = false; }
    if (smsTimer) { clearInterval(smsTimer); smsTimer = null; }
    if (phoneConfirmBtn) { phoneConfirmBtn.textContent = '确认更换'; phoneConfirmBtn.disabled = false; }
  }

  if (btnChangePhone && phoneSheet) {
    btnChangePhone.addEventListener('click', function() {
      resetPhoneSheet();
      openSheet(phoneSheet);
    });
  }

  // Step 1: 发送验证码（到当前手机号）
  if (phoneStep1SmsBtn) {
    phoneStep1SmsBtn.addEventListener('click', function() {
      phoneStep1SmsBtn.disabled = true;
      var sec = 60;
      phoneStep1SmsBtn.textContent = sec + 's';
      phoneStep1Timer = setInterval(function() {
        sec--;
        phoneStep1SmsBtn.textContent = sec + 's';
        if (sec <= 0) {
          clearInterval(phoneStep1Timer);
          phoneStep1Timer = null;
          phoneStep1SmsBtn.textContent = '重新发送';
          phoneStep1SmsBtn.disabled = false;
        }
      }, 1000);
      MiFiUI.showToast('验证码已发送至当前手机号');
    });
  }

  // Step 1: 验证身份 → 进入 Step 2
  if (phoneStep1Btn) {
    phoneStep1Btn.addEventListener('click', function() {
      var sms = phoneStep1Sms ? phoneStep1Sms.value.trim() : '';
      if (sms !== '123456') {
        if (phoneStep1Hint) { phoneStep1Hint.textContent = '验证码错误（演示用：123456）'; phoneStep1Hint.style.color = 'var(--err)'; phoneStep1Hint.style.display = ''; }
        return;
      }
      // 验证通过，切换到 Step 2
      if (phoneStep1) phoneStep1.style.display = 'none';
      if (phoneStep2) phoneStep2.style.display = '';
      if (phoneSheetTitle) phoneSheetTitle.textContent = '输入新手机号';
    });
  }

  // Step 2: 发送验证码（到新手机号）
  if (smsBtn) {
    smsBtn.addEventListener('click', function() {
      var phone = phoneInput ? phoneInput.value.trim() : '';
      if (!phone || phone.length < 11) {
        if (phoneHint) { phoneHint.textContent = '请输入正确的手机号'; phoneHint.style.color = 'var(--err)'; phoneHint.style.display = ''; }
        return;
      }
      smsBtn.disabled = true;
      var sec = 60;
      smsBtn.textContent = sec + 's';
      smsTimer = setInterval(function() {
        sec--;
        smsBtn.textContent = sec + 's';
        if (sec <= 0) {
          clearInterval(smsTimer);
          smsTimer = null;
          smsBtn.textContent = '重新发送';
          smsBtn.disabled = false;
        }
      }, 1000);
      MiFiUI.showToast('验证码已发送');
    });
  }

  // Step 2: 确认更换
  if (phoneConfirmBtn) {
    phoneConfirmBtn.addEventListener('click', function() {
      var phone = phoneInput ? phoneInput.value.trim() : '';
      var sms = smsInput ? smsInput.value.trim() : '';
      if (!phone || phone.length < 11) {
        if (phoneHint) { phoneHint.textContent = '请输入正确的手机号'; phoneHint.style.color = 'var(--err)'; phoneHint.style.display = ''; }
        return;
      }
      if (sms !== '123456') {
        if (phoneHint) { phoneHint.textContent = '验证码错误（演示用：123456）'; phoneHint.style.color = 'var(--err)'; phoneHint.style.display = ''; }
        return;
      }
      phoneConfirmBtn.textContent = '更换中…';
      phoneConfirmBtn.disabled = true;
      setTimeout(function() {
        MiFiUser.updateProfile({ phone: phone });
        if (setPhone) setPhone.textContent = phone;
        closeSheet();
        MiFiUI.showToast('手机号已更新');
        resetPhoneSheet();
      }, 600);
    });
  }

  // === 检查更新 ===
  var btnCheckUpdate = document.getElementById('btnCheckUpdate');
  if (btnCheckUpdate) {
    btnCheckUpdate.addEventListener('click', function() {
      var el = btnCheckUpdate.querySelector('.mi-main span');
      var orig = el ? el.textContent : '';
      if (el) el.innerHTML = '正在检查…';
      setTimeout(function() {
        if (el) el.innerHTML = '已是最新版本 ✓';
        el.style.color = 'var(--ok)';
        MiFiUI.showToast('已是最新版本');
        setTimeout(function() {
          if (el) { el.innerHTML = orig; el.style.color = ''; }
        }, 2000);
      }, 1200);
    });
  }

  // === 隐私协议 ===
  var btnPrivacy = document.getElementById('btnPrivacy');
  if (btnPrivacy) {
    btnPrivacy.addEventListener('click', function() {
      MiFiUI.showToast('隐私协议页面开发中');
    });
  }

  // === 清除缓存 ===
  var btnClearCache = document.getElementById('btnClearCache');
  var cacheMask = document.getElementById('cacheConfirmMask');
  var cacheDialog = document.getElementById('cacheConfirmDialog');
  var cacheCancel = document.getElementById('cacheCancel');
  var cacheOk = document.getElementById('cacheOk');

  function hideCacheConfirm() {
    if (cacheMask) cacheMask.classList.remove('show');
    if (cacheDialog) cacheDialog.classList.remove('show');
  }

  if (btnClearCache) {
    btnClearCache.addEventListener('click', function() {
      if (cacheMask) cacheMask.classList.add('show');
      if (cacheDialog) cacheDialog.classList.add('show');
    });
  }

  if (cacheCancel) cacheCancel.addEventListener('click', hideCacheConfirm);
  if (cacheMask) cacheMask.addEventListener('click', hideCacheConfirm);

  if (cacheOk) {
    cacheOk.addEventListener('click', function() {
      hideCacheConfirm();
      var el = btnClearCache ? btnClearCache.querySelector('.mi-main span em') : null;
      if (el) el.textContent = '0 MB';
      MiFiUI.showToast('缓存已清除');
    });
  }

  // === 注销账号 ===
  var btnDeleteAccount = document.getElementById('btnDeleteAccount');
  var delMask = document.getElementById('deleteAccountMask');
  var delDialog = document.getElementById('deleteAccountDialog');
  var delCancel = document.getElementById('deleteAccountCancel');
  var delOk = document.getElementById('deleteAccountOk');

  function hideDelConfirm() {
    if (delMask) delMask.classList.remove('show');
    if (delDialog) delDialog.classList.remove('show');
  }

  if (btnDeleteAccount) {
    btnDeleteAccount.addEventListener('click', function() {
      if (delMask) delMask.classList.add('show');
      if (delDialog) delDialog.classList.add('show');
    });
  }

  if (delCancel) delCancel.addEventListener('click', hideDelConfirm);
  if (delMask) delMask.addEventListener('click', hideDelConfirm);

  // 注销验证码抽屉
  var deleteVerifySheet = document.getElementById('deleteVerifySheet');
  var deleteSmsInput = document.getElementById('deleteSmsInput');
  var deleteSmsBtn = document.getElementById('deleteSmsBtn');
  var deleteVerifyConfirmBtn = document.getElementById('deleteVerifyConfirmBtn');
  var deleteVerifyHint = document.getElementById('deleteVerifyHint');
  var deleteSmsTimer = null;

  if (delOk) {
    delOk.addEventListener('click', function() {
      hideDelConfirm();
      // 重置验证码抽屉状态
      if (deleteSmsInput) deleteSmsInput.value = '';
      if (deleteVerifyHint) { deleteVerifyHint.textContent = ''; deleteVerifyHint.style.display = 'none'; }
      if (deleteSmsBtn) { deleteSmsBtn.textContent = '发送验证码'; deleteSmsBtn.disabled = false; }
      if (deleteSmsTimer) { clearInterval(deleteSmsTimer); deleteSmsTimer = null; }
      openSheet(deleteVerifySheet);
    });
  }

  if (deleteSmsBtn) {
    deleteSmsBtn.addEventListener('click', function() {
      deleteSmsBtn.disabled = true;
      var sec = 60;
      deleteSmsBtn.textContent = sec + 's';
      deleteSmsTimer = setInterval(function() {
        sec--;
        deleteSmsBtn.textContent = sec + 's';
        if (sec <= 0) {
          clearInterval(deleteSmsTimer);
          deleteSmsTimer = null;
          deleteSmsBtn.textContent = '重新发送';
          deleteSmsBtn.disabled = false;
        }
      }, 1000);
      MiFiUI.showToast('验证码已发送');
    });
  }

  if (deleteVerifyConfirmBtn) {
    deleteVerifyConfirmBtn.addEventListener('click', function() {
      var sms = deleteSmsInput ? deleteSmsInput.value.trim() : '';
      if (sms !== '123456') {
        if (deleteVerifyHint) { deleteVerifyHint.textContent = '验证码错误（演示用：123456）'; deleteVerifyHint.style.color = 'var(--err)'; deleteVerifyHint.style.display = ''; }
        return;
      }
      deleteVerifyConfirmBtn.textContent = '注销中…';
      deleteVerifyConfirmBtn.disabled = true;
      setTimeout(function() {
        closeSheet();
        localStorage.clear();
        MiFiUI.showToast('账号已注销');
        setTimeout(function() {
          window.location.href = 'login.html';
        }, 800);
      }, 600);
    });
  }

  // === 退出登录 ===
  var btnLogout = document.getElementById('btnLogout');
  var logoutMask = document.getElementById('logoutConfirmMask');
  var logoutDialog = document.getElementById('logoutConfirmDialog');
  var logoutCancel = document.getElementById('logoutCancel');
  var logoutOk = document.getElementById('logoutOk');

  function hideLogoutConfirm() {
    if (logoutMask) logoutMask.classList.remove('show');
    if (logoutDialog) logoutDialog.classList.remove('show');
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', function() {
      if (logoutMask) logoutMask.classList.add('show');
      if (logoutDialog) logoutDialog.classList.add('show');
    });
  }

  if (logoutCancel) logoutCancel.addEventListener('click', hideLogoutConfirm);
  if (logoutMask) logoutMask.addEventListener('click', hideLogoutConfirm);

  if (logoutOk) {
    logoutOk.addEventListener('click', function() {
      MiFiUser.logout();
      window.location.href = 'login.html';
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
