/* ============================================
   SARKAR TRAVEL AGENCY — Settings Page Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadSettingsForm();
  bindSettingsEvents();
});

function loadSettingsForm() {
  const s = Storage.getSettings();

  document.getElementById('set-company-name').value = s.companyName || '';
  document.getElementById('set-tagline').value = s.tagline || '';
  document.getElementById('set-tagline2').value = s.tagline2 || '';
  document.getElementById('set-address').value = s.address || '';
  document.getElementById('set-phone').value = s.phone || '';
  document.getElementById('set-email').value = s.email || '';
  document.getElementById('set-gstin').value = s.gstin || '';

  // Logo preview
  const preview = document.getElementById('logo-preview');
  if (preview) {
    preview.src = s.logo || 'assets/logo.png';
  }
}

function bindSettingsEvents() {
  // Logo upload
  const logoInput = document.getElementById('set-logo');
  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert('Logo file size must be under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        document.getElementById('logo-preview').src = base64;
      };
      reader.readAsDataURL(file);
    });
  }

  // Save button
  document.getElementById('btn-save-settings')?.addEventListener('click', () => {
    saveAllSettings();
  });

  // Reset to defaults
  document.getElementById('btn-reset-settings')?.addEventListener('click', () => {
    if (confirm('Reset all settings to defaults?')) {
      localStorage.removeItem(Storage.KEYS.SETTINGS);
      loadSettingsForm();
      alert('Settings reset to defaults.');
    }
  });
}

function saveAllSettings() {
  const logoPreview = document.getElementById('logo-preview');

  const settings = {
    companyName: document.getElementById('set-company-name').value.trim(),
    tagline: document.getElementById('set-tagline').value.trim(),
    tagline2: document.getElementById('set-tagline2').value.trim(),
    address: document.getElementById('set-address').value.trim(),
    phone: document.getElementById('set-phone').value.trim(),
    email: document.getElementById('set-email').value.trim(),
    gstin: document.getElementById('set-gstin').value.trim(),
    logo: logoPreview?.src || 'assets/logo.png',
  };

  const success = Storage.saveSettings(settings);

  if (success) {
    alert('Settings saved successfully!');
    // Optionally redirect back
    // window.location.href = 'index.html';
  } else {
    alert('Error saving settings. Please try again.');
  }
}
