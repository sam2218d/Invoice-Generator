/* ============================================
   SARKAR TRAVEL AGENCY — Main Application Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadSettingsIntoHeader();
  setInvoiceDate();
  setInvoiceNumber();
  addVehicleRow();
  bindEvents();
  recalcAll();
}

/* ── Load Company Settings ── */
function loadSettingsIntoHeader() {
  const s = Storage.getSettings();

  // Header
  const nameEl = document.getElementById('agency-name');
  const taglineEl = document.getElementById('agency-tagline');
  const addressEl = document.getElementById('header-address');
  const phoneEl = document.getElementById('header-phone');
  const emailEl = document.getElementById('header-email');
  const logoEls = document.querySelectorAll('.dynamic-logo');
  const footerTagline = document.getElementById('footer-tagline');

  if (nameEl) nameEl.textContent = s.companyName;
  if (taglineEl) taglineEl.textContent = s.tagline;
  if (addressEl) addressEl.textContent = s.address;
  if (phoneEl) phoneEl.textContent = s.phone;
  if (emailEl) emailEl.textContent = s.email;
  if (footerTagline) footerTagline.textContent = s.tagline2;

  logoEls.forEach(img => {
    img.src = s.logo;
    img.onerror = () => {
      img.src = 'assets/logo.png';
    };
  });
}

/* ── Invoice Date & Number ── */
function setInvoiceDate() {
  const dateInput = document.getElementById('invoice-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

function setInvoiceNumber() {
  const numInput = document.getElementById('invoice-number');
  if (numInput) {
    const num = Storage.getCurrentInvoiceNumber();
    numInput.value = Storage.formatInvoiceNumber(num);
  }
}

/* ── Vehicle Rows ── */
let vehicleRowCount = 0;

function addVehicleRow(data = null) {
  vehicleRowCount++;
  const tbody = document.getElementById('vehicle-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.dataset.rowId = vehicleRowCount;
  tr.innerHTML = `
    <td>${vehicleRowCount}</td>
    <td><input type="text" class="v-number" placeholder="MH 01 XX 1234" value="${data?.vehicleNumber || ''}"></td>
    <td>
      <select class="v-type">
        <option value="">Select</option>
        <option value="Wagon R" ${data?.vehicleType === 'Wagon R' ? 'selected' : ''}>Wagon R</option>
        <option value="Swift" ${data?.vehicleType === 'Swift' ? 'selected' : ''}>Swift</option>
        <option value="Swift Dzire" ${data?.vehicleType === 'Swift Dzire' ? 'selected' : ''}>Swift Dzire</option>
        <option value="Ertiga" ${data?.vehicleType === 'Ertiga' ? 'selected' : ''}>Ertiga</option>
        <option value="Innova Crysta" ${data?.vehicleType === 'Innova Crysta' ? 'selected' : ''}>Innova Crysta</option>
        <option value="Hycross" ${data?.vehicleType === 'Hycross' ? 'selected' : ''}>Hycross</option>
        <option value="Fortuner" ${data?.vehicleType === 'Fortuner' ? 'selected' : ''}>Fortuner</option>
        <option value="Scorpio N" ${data?.vehicleType === 'Scorpio N' ? 'selected' : ''}>Scorpio N</option>
        <option value="Other" ${data?.vehicleType === 'Other' ? 'selected' : ''}>Other</option>
      </select>
    </td>
    <td><input type="text" class="v-driver" placeholder="Driver" value="${data?.driver || ''}"></td>
    <td><div class="datetime-cell"><input type="date" class="v-start-date" value="${data?.startDate || ''}"><input type="time" class="v-start-time" value="${data?.startTime || ''}"></div></td>
    <td><div class="datetime-cell"><input type="date" class="v-end-date" value="${data?.endDate || ''}"><input type="time" class="v-end-time" value="${data?.endTime || ''}"></div></td>
    <td><input type="number" class="v-start-km" placeholder="0" min="0" value="${data?.startKm || ''}"></td>
    <td><input type="number" class="v-end-km" placeholder="0" min="0" value="${data?.endKm || ''}"></td>
    <td class="v-total-km font-bold">0</td>
    <td><button class="remove-row-btn" title="Remove row" onclick="removeVehicleRow(this)">✕</button></td>
  `;

  tbody.appendChild(tr);
  renumberVehicleRows();
  recalcVehicleTotals();
}

function removeVehicleRow(btn) {
  const tr = btn.closest('tr');
  if (tr) {
    tr.remove();
    renumberVehicleRows();
    recalcVehicleTotals();
  }
}

function renumberVehicleRows() {
  const rows = document.querySelectorAll('#vehicle-tbody tr');
  rows.forEach((row, i) => {
    row.children[0].textContent = i + 1;
  });
}

function recalcVehicleTotals() {
  let totalKm = 0;
  let totalDays = 0;
  const rows = document.querySelectorAll('#vehicle-tbody tr');

  rows.forEach(row => {
    const startKm = parseFloat(row.querySelector('.v-start-km')?.value) || 0;
    const endKm = parseFloat(row.querySelector('.v-end-km')?.value) || 0;
    const rowTotal = Math.max(0, endKm - startKm);
    const totalCell = row.querySelector('.v-total-km');
    if (totalCell) totalCell.textContent = rowTotal.toLocaleString('en-IN');
    totalKm += rowTotal;

    // Calculate days for this vehicle row
    const startDateStr = row.querySelector('.v-start-date')?.value;
    const endDateStr = row.querySelector('.v-end-date')?.value;
    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      if (!isNaN(startDate) && !isNaN(endDate) && endDate >= startDate) {
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
        totalDays += diffDays;
      }
    }
  });

  const grandTotalEl = document.getElementById('vehicle-total-km');
  if (grandTotalEl) grandTotalEl.textContent = totalKm.toLocaleString('en-IN');

  // Auto-fill "Per KM" quantity in charges
  const perKmQty = document.getElementById('charge-perkm-qty');
  if (perKmQty) perKmQty.value = totalKm;

  // Auto-fill "Per Day Price" quantity with total days from all vehicles
  const perDayQty = document.getElementById('charge-perday-qty');
  if (perDayQty) perDayQty.value = totalDays;

  recalcCharges();
}

/* ── Charges Calculation ── */
function recalcCharges() {
  let subtotal = 0;
  const chargeRows = document.querySelectorAll('.charge-row');

  chargeRows.forEach(row => {
    const qtyInput = row.querySelector('.charge-qty');
    const rateInput = row.querySelector('.charge-rate');
    const amountCell = row.querySelector('.charge-amount');

    if (qtyInput && rateInput && amountCell) {
      const qty = parseFloat(qtyInput.value) || 0;
      const rate = parseFloat(rateInput.value) || 0;
      const amount = qty * rate;

      amountCell.textContent = amount > 0 ? '₹ ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '₹ 0.00';
      amountCell.dataset.value = amount;
      subtotal += amount;
    }
  });

  const chargeTotalEl = document.getElementById('charges-total');
  if (chargeTotalEl) chargeTotalEl.textContent = '₹ ' + subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  recalcBilling(subtotal);
}

function recalcBilling(subtotal) {
  if (typeof subtotal === 'undefined') {
    subtotal = 0;
    document.querySelectorAll('.charge-row').forEach(row => {
      const amountCell = row.querySelector('.charge-amount');
      subtotal += parseFloat(amountCell?.dataset.value) || 0;
    });
  }

  const gstSelect = document.getElementById('gst-percent');
  const discountInput = document.getElementById('discount-input');
  const advanceInput = document.getElementById('advance-input');

  const gstPercent = parseFloat(gstSelect?.value) || 0;
  const discountPercent = parseFloat(discountInput?.value) || 0;
  const advance = parseFloat(advanceInput?.value) || 0;

  const gstAmount = subtotal * (gstPercent / 100);
  const totalPrice = subtotal + gstAmount;
  const discountAmount = totalPrice * (discountPercent / 100);
  const finalTotal = totalPrice - discountAmount - advance;

  document.getElementById('billing-subtotal').textContent = '₹ ' + subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  document.getElementById('billing-gst-amount').textContent = '₹ ' + gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  document.getElementById('billing-total').textContent = '₹ ' + totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  document.getElementById('billing-discount-amount').textContent = '₹ ' + discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  document.getElementById('billing-final').textContent = '₹ ' + finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function recalcAll() {
  recalcVehicleTotals();
}

/* ── Event Binding ── */
function bindEvents() {
  // Vehicle table input changes (KM and date changes)
  const vehicleTable = document.getElementById('vehicle-table');
  if (vehicleTable) {
    vehicleTable.addEventListener('input', (e) => {
      if (e.target.matches('.v-start-km, .v-end-km')) {
        recalcVehicleTotals();
      }
    });
    vehicleTable.addEventListener('change', (e) => {
      if (e.target.matches('.v-start-date, .v-end-date')) {
        recalcVehicleTotals();
      }
    });
  }

  // Charges table input changes
  const chargesTable = document.getElementById('charges-table');
  if (chargesTable) {
    chargesTable.addEventListener('input', () => {
      recalcCharges();
    });
  }

  // Billing inputs
  document.getElementById('gst-percent')?.addEventListener('change', () => recalcBilling());
  document.getElementById('discount-input')?.addEventListener('input', () => recalcBilling());
  document.getElementById('advance-input')?.addEventListener('input', () => recalcBilling());

  // Add vehicle row button
  document.getElementById('btn-add-vehicle')?.addEventListener('click', () => addVehicleRow());

  // Print button
  document.getElementById('btn-print')?.addEventListener('click', () => {
    window.print();
  });

  // Download PDF button
  document.getElementById('btn-pdf')?.addEventListener('click', () => {
    generatePDF();
  });

  // Reset button
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Save current invoice and start a new one?')) {
      saveCurrentInvoice();
      resetInvoice();
    }
  });

  // Duplicate button
  document.getElementById('btn-duplicate')?.addEventListener('click', () => {
    duplicateLastInvoice();
  });

  // History button
  document.getElementById('btn-history')?.addEventListener('click', () => {
    toggleHistory();
  });

  // History close
  document.getElementById('history-close')?.addEventListener('click', () => {
    closeHistory();
  });

  document.getElementById('history-overlay')?.addEventListener('click', () => {
    closeHistory();
  });

  // Save Invoice button
  document.getElementById('btn-save')?.addEventListener('click', () => {
    saveCurrentInvoice();
    alert('Invoice saved successfully!');
    refreshHistoryList();
  });
}

/* ── Save / Load Invoice ── */
function collectInvoiceData() {
  const vehicleRows = [];
  document.querySelectorAll('#vehicle-tbody tr').forEach(row => {
    vehicleRows.push({
      vehicleNumber: row.querySelector('.v-number')?.value || '',
      vehicleType: row.querySelector('.v-type')?.value || '',
      driver: row.querySelector('.v-driver')?.value || '',
      startDate: row.querySelector('.v-start-date')?.value || '',
      startTime: row.querySelector('.v-start-time')?.value || '',
      endDate: row.querySelector('.v-end-date')?.value || '',
      endTime: row.querySelector('.v-end-time')?.value || '',
      startKm: row.querySelector('.v-start-km')?.value || '',
      endKm: row.querySelector('.v-end-km')?.value || '',
    });
  });

  const charges = [];
  document.querySelectorAll('.charge-row').forEach(row => {
    charges.push({
      id: row.dataset.chargeId,
      qty: row.querySelector('.charge-qty')?.value || '',
      rate: row.querySelector('.charge-rate')?.value || '',
    });
  });

  return {
    customerName: document.getElementById('customer-name')?.value || '',
    invoiceDate: document.getElementById('invoice-date')?.value || '',
    invoiceNumber: document.getElementById('invoice-number')?.value || '',
    gstin: document.getElementById('customer-gstin')?.value || '',
    startingPlace: document.getElementById('starting-place')?.value || '',
    visitingPlace: document.getElementById('visiting-place')?.value || '',
    droppingPlace: document.getElementById('dropping-place')?.value || '',
    numPassengers: document.getElementById('num-passengers')?.value || '',
    vehicles: vehicleRows,
    charges: charges,
    gstPercent: document.getElementById('gst-percent')?.value || '0',
    discount: document.getElementById('discount-input')?.value || '0',
    advance: document.getElementById('advance-input')?.value || '0',
    finalTotal: document.getElementById('billing-final')?.textContent || '₹ 0.00',
  };
}

function saveCurrentInvoice() {
  const data = collectInvoiceData();
  Storage.saveInvoice(data);
  Storage.incrementInvoiceNumber();
}

function loadInvoice(invoiceData) {
  // Clear vehicle rows
  const tbody = document.getElementById('vehicle-tbody');
  tbody.innerHTML = '';
  vehicleRowCount = 0;

  // Set fields
  document.getElementById('customer-name').value = invoiceData.customerName || '';
  document.getElementById('invoice-date').value = invoiceData.invoiceDate || '';
  document.getElementById('invoice-number').value = invoiceData.invoiceNumber || '';
  if (document.getElementById('customer-gstin')) {
    document.getElementById('customer-gstin').value = invoiceData.gstin || '';
  }

  // Travel details
  document.getElementById('starting-place').value = invoiceData.startingPlace || '';
  document.getElementById('visiting-place').value = invoiceData.visitingPlace || '';
  document.getElementById('dropping-place').value = invoiceData.droppingPlace || '';
  document.getElementById('num-passengers').value = invoiceData.numPassengers || '';

  // Add vehicle rows
  if (invoiceData.vehicles && invoiceData.vehicles.length > 0) {
    invoiceData.vehicles.forEach(v => addVehicleRow(v));
  } else {
    addVehicleRow();
  }

  // Set charges
  if (invoiceData.charges) {
    invoiceData.charges.forEach(c => {
      const row = document.querySelector(`.charge-row[data-charge-id="${c.id}"]`);
      if (row) {
        const qtyInput = row.querySelector('.charge-qty');
        const rateInput = row.querySelector('.charge-rate');
        if (qtyInput) qtyInput.value = c.qty;
        if (rateInput) rateInput.value = c.rate;
      }
    });
  }

  // Set billing
  document.getElementById('gst-percent').value = invoiceData.gstPercent || '0';
  document.getElementById('discount-input').value = invoiceData.discount || '0';
  document.getElementById('advance-input').value = invoiceData.advance || '0';

  recalcAll();
}

function resetInvoice() {
  // Clear customer fields
  document.getElementById('customer-name').value = '';
  if (document.getElementById('customer-gstin')) {
    document.getElementById('customer-gstin').value = '';
  }

  // Clear travel details
  document.getElementById('starting-place').value = '';
  document.getElementById('visiting-place').value = '';
  document.getElementById('dropping-place').value = '';
  document.getElementById('num-passengers').value = '';

  // Reset date
  setInvoiceDate();

  // New invoice number
  setInvoiceNumber();

  // Clear vehicle rows
  const tbody = document.getElementById('vehicle-tbody');
  tbody.innerHTML = '';
  vehicleRowCount = 0;
  addVehicleRow();

  // Clear charges
  document.querySelectorAll('.charge-row').forEach(row => {
    const qtyInput = row.querySelector('.charge-qty');
    const rateInput = row.querySelector('.charge-rate');
    if (qtyInput) qtyInput.value = '';
    if (rateInput) rateInput.value = '';
  });

  // Clear billing
  document.getElementById('gst-percent').value = '0';
  document.getElementById('discount-input').value = '';
  document.getElementById('advance-input').value = '';

  recalcAll();
}

function duplicateLastInvoice() {
  const last = Storage.getLastInvoice();
  if (!last) {
    alert('No previous invoice found to duplicate.');
    return;
  }

  loadInvoice(last);
  // Set new invoice number and today's date
  setInvoiceNumber();
  setInvoiceDate();
  recalcAll();
  alert('Last invoice duplicated. Review and update as needed.');
}

/* ── History Panel ── */
function toggleHistory() {
  const panel = document.getElementById('history-panel');
  const overlay = document.getElementById('history-overlay');
  panel.classList.toggle('open');
  overlay.classList.toggle('open');
  if (panel.classList.contains('open')) {
    refreshHistoryList();
  }
}

function closeHistory() {
  document.getElementById('history-panel')?.classList.remove('open');
  document.getElementById('history-overlay')?.classList.remove('open');
}

function refreshHistoryList() {
  const list = document.getElementById('history-list');
  if (!list) return;

  const invoices = Storage.getInvoices();

  if (invoices.length === 0) {
    list.innerHTML = '<div class="history-empty">📋 No saved invoices yet.</div>';
    return;
  }

  list.innerHTML = invoices.map(inv => `
    <div class="history-item" onclick="loadHistoryItem(${inv.id})">
      <div class="history-item-info">
        <h4>${inv.invoiceNumber || 'N/A'}</h4>
        <p>${inv.customerName || 'Unknown'} • ${inv.invoiceDate || 'No date'}</p>
      </div>
      <div class="history-item-amount">${inv.finalTotal || '₹ 0.00'}</div>
    </div>
  `).join('');
}

function loadHistoryItem(id) {
  const inv = Storage.getInvoiceById(id);
  if (inv) {
    loadInvoice(inv);
    closeHistory();
  }
}
