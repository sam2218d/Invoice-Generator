/* ============================================
   SARKAR TRAVEL AGENCY — Storage Module
   localStorage helpers for settings, invoices, counters
   ============================================ */

const Storage = {
  KEYS: {
    SETTINGS: 'sta_settings',
    INVOICES: 'sta_invoices',
    COUNTER: 'sta_invoice_counter',
  },

  /* ── Company Settings ── */
  getDefaultSettings() {
    return {
      companyName: 'SARKAR TRAVEL AGENCY',
      tagline: 'Authorized Travel Agents & Tour Operators',
      tagline2: 'EXPLORE. DRIVE. DISCOVER.',
      address: '45, Main Road, City, State, Zip',
      phone: '+91 98765 43210',
      email: 'email@agency.com',
      gstin: '',
      logo: 'assets/logo.png',
    };
  },

  getSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      if (data) {
        return { ...this.getDefaultSettings(), ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading settings:', e);
    }
    return this.getDefaultSettings();
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Error saving settings:', e);
      return false;
    }
  },

  /* ── Invoice Counter ── */
  getNextInvoiceNumber() {
    try {
      let counter = parseInt(localStorage.getItem(this.KEYS.COUNTER)) || 0;
      counter++;
      return counter;
    } catch (e) {
      return 1;
    }
  },

  getCurrentInvoiceNumber() {
    try {
      let counter = parseInt(localStorage.getItem(this.KEYS.COUNTER)) || 0;
      return counter + 1;
    } catch (e) {
      return 1;
    }
  },

  incrementInvoiceNumber() {
    try {
      let counter = parseInt(localStorage.getItem(this.KEYS.COUNTER)) || 0;
      counter++;
      localStorage.setItem(this.KEYS.COUNTER, counter.toString());
      return counter;
    } catch (e) {
      console.error('Error incrementing counter:', e);
      return 1;
    }
  },

  formatInvoiceNumber(num) {
    return 'STA-' + String(num).padStart(6, '0');
  },

  /* ── Invoice History ── */
  getInvoices() {
    try {
      const data = localStorage.getItem(this.KEYS.INVOICES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading invoices:', e);
      return [];
    }
  },

  saveInvoice(invoiceData) {
    try {
      const invoices = this.getInvoices();
      invoiceData.id = Date.now();
      invoiceData.savedAt = new Date().toISOString();
      invoices.unshift(invoiceData);
      // Keep last 100 invoices
      if (invoices.length > 100) invoices.pop();
      localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(invoices));
      return true;
    } catch (e) {
      console.error('Error saving invoice:', e);
      return false;
    }
  },

  getInvoiceById(id) {
    const invoices = this.getInvoices();
    return invoices.find(inv => inv.id === id) || null;
  },

  getLastInvoice() {
    const invoices = this.getInvoices();
    return invoices.length > 0 ? invoices[0] : null;
  },

  deleteInvoice(id) {
    try {
      let invoices = this.getInvoices();
      invoices = invoices.filter(inv => inv.id !== id);
      localStorage.setItem(this.KEYS.INVOICES, JSON.stringify(invoices));
      return true;
    } catch (e) {
      console.error('Error deleting invoice:', e);
      return false;
    }
  },
};
