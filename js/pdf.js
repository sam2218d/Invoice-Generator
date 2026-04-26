/* ============================================
   SARKAR TRAVEL AGENCY — PDF Generation
   Landscape A4 output with optimized spacing
   ============================================ */

function generatePDF() {
  const invoice = document.getElementById('invoice-card');
  if (!invoice) {
    alert('No invoice found to export.');
    return;
  }

  // Check if html2pdf is loaded
  if (typeof html2pdf === 'undefined') {
    alert('PDF library is loading. Please wait a moment and try again.');
    return;
  }

  // Get invoice number for filename
  const invoiceNum = document.getElementById('invoice-number')?.value || 'invoice';
  const filename = `${invoiceNum}.pdf`;

  // Hide non-printable elements temporarily
  const noPrintEls = document.querySelectorAll('.remove-row-btn, .section-title button, .no-print');
  noPrintEls.forEach(el => el.style.display = 'none');

  // Temporarily apply compact styles for PDF capture
  invoice.style.fontSize = '8px';
  document.querySelectorAll('.invoice-header').forEach(el => el.style.padding = '6px 16px');
  document.querySelectorAll('.header-logo').forEach(el => { el.style.width = '40px'; el.style.height = '40px'; });
  document.querySelectorAll('.customer-bar').forEach(el => el.style.padding = '4px 16px');
  document.querySelectorAll('.section-title').forEach(el => el.style.padding = '2px 10px');
  document.querySelectorAll('.data-table thead th').forEach(el => el.style.padding = '2px 3px');
  document.querySelectorAll('.data-table tbody td').forEach(el => el.style.padding = '1px 3px');
  document.querySelectorAll('.billing-row').forEach(el => el.style.padding = '1px 8px');
  document.querySelectorAll('.billing-section').forEach(el => el.style.padding = '0 16px 4px');
  document.querySelectorAll('.invoice-footer').forEach(el => el.style.padding = '4px 16px 0');
  document.querySelectorAll('.sig-line').forEach(el => el.style.marginTop = '18px');
  document.querySelectorAll('.signatures').forEach(el => { el.style.marginBottom = '4px'; el.style.padding = '0 20px'; });
  document.querySelectorAll('.travel-fields').forEach(el => el.style.padding = '2px 16px 4px');
  document.querySelectorAll('.footer-tagline').forEach(el => { el.style.padding = '3px 0'; el.style.margin = '0 -16px 0'; });

  const options = {
    margin: [4, 4, 4, 4],
    filename: filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape',
    },
    pagebreak: { mode: ['avoid-all'] },
  };

  // Note: PDF uses landscape orientation directly (no CSS rotation needed)

  html2pdf()
    .set(options)
    .from(invoice)
    .save()
    .then(() => {
      restoreStyles(invoice, noPrintEls);
    })
    .catch(err => {
      console.error('PDF generation error:', err);
      restoreStyles(invoice, noPrintEls);
      alert('Error generating PDF. Please try again.');
    });
}

function restoreStyles(invoice, noPrintEls) {
  // Restore hidden elements
  noPrintEls.forEach(el => el.style.display = '');

  // Remove inline compact styles
  invoice.style.fontSize = '';
  document.querySelectorAll('.invoice-header').forEach(el => el.style.padding = '');
  document.querySelectorAll('.header-logo').forEach(el => { el.style.width = ''; el.style.height = ''; });
  document.querySelectorAll('.customer-bar').forEach(el => el.style.padding = '');
  document.querySelectorAll('.section-title').forEach(el => el.style.padding = '');
  document.querySelectorAll('.data-table thead th').forEach(el => el.style.padding = '');
  document.querySelectorAll('.data-table tbody td').forEach(el => el.style.padding = '');
  document.querySelectorAll('.billing-row').forEach(el => el.style.padding = '');
  document.querySelectorAll('.billing-section').forEach(el => el.style.padding = '');
  document.querySelectorAll('.invoice-footer').forEach(el => el.style.padding = '');
  document.querySelectorAll('.sig-line').forEach(el => el.style.marginTop = '');
  document.querySelectorAll('.signatures').forEach(el => el.style.marginBottom = '');
  document.querySelectorAll('.travel-fields').forEach(el => el.style.padding = '');
  document.querySelectorAll('.footer-tagline').forEach(el => { el.style.padding = ''; el.style.margin = ''; });
}
