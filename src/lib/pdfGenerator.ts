interface Offer {
  offer_number: string;
  client_naziv: string;
  client_oib: string;
  client_adresa: string;
  napomena: string;
  ukupno: number;
  created_at: string;
}

interface OfferItem {
  opis: string;
  jedinica: string;
  kolicina: number;
  cijena: number;
  ukupno: number;
  group_id?: string;
}

interface OfferGroup {
  id: string;
  naziv: string;
  opis?: string;
  redni_broj: number;
}

interface CompanyProfile {
  naziv_firme: string;
  oib: string;
  adresa: string;
  iban: string;
  email: string;
  telefon: string;
  logo_url: string;
}

const formatNumber = (num: number) => {
  return num.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const generatePDF = (
  offer: Offer,
  items: OfferItem[],
  company: CompanyProfile,
  groups?: OfferGroup[]
) => {
  const offerNumber = offer.offer_number;

  // Generate items HTML, grouped if groups exist
  let itemsHtml = '';

  if (groups && groups.length > 0) {
    groups.sort((a, b) => a.redni_broj - b.redni_broj);
    
    groups.forEach((group) => {
      const groupItems = items.filter(item => item.group_id === group.id);
      
      if (groupItems.length > 0 || group.naziv) {
        // Group header
        itemsHtml += `
          <tr>
            <td colspan="6" style="padding: 12px 8px 8px; font-weight: bold; font-size: 12px; background: #f0f4ff; border-bottom: 1px solid #e0e0e0;">
              ${group.redni_broj}. ${group.naziv}
              ${group.opis ? `<div style="font-weight: normal; font-size: 11px; margin-top: 4px; color: #666;">${group.opis}</div>` : ''}
            </td>
          </tr>
        `;
        
        // Group items with hierarchical numbering
        groupItems.forEach((item, itemIndex) => {
          const bgColor = itemIndex % 2 === 0 ? '#fff' : '#fafafa';
          itemsHtml += `
            <tr style="background: ${bgColor}; page-break-inside: avoid;">
              <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: center; width: 40px; color: #666;">${group.redni_broj}.${itemIndex + 1}.</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0;">${item.opis}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: center; width: 50px;">${item.jedinica || 'kom'}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: center; width: 60px;">${Number(item.kolicina)}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: right; width: 100px;">${formatNumber(Number(item.cijena))} €</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: right; width: 100px; font-weight: 500;">${formatNumber(Number(item.ukupno))} €</td>
            </tr>
          `;
        });
      }
    });
  } else {
    // No groups - flat items
    items.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#fff' : '#fafafa';
      itemsHtml += `
        <tr style="background: ${bgColor}; page-break-inside: avoid;">
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: center; width: 40px; color: #666;">${index + 1}.</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0;">${item.opis}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: center; width: 50px;">${item.jedinica || 'kom'}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: center; width: 60px;">${Number(item.kolicina)}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: right; width: 100px;">${formatNumber(Number(item.cijena))} €</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e0e0e0; text-align: right; width: 100px; font-weight: 500;">${formatNumber(Number(item.ukupno))} €</td>
        </tr>
      `;
    });
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ponuda ${offer.offer_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 0; 
          color: #333; 
          font-size: 11px;
          line-height: 1.5;
          background: #fff;
        }
        
        .header {
          background: linear-gradient(135deg, #f0f4ff 0%, #e8efff 100%);
          padding: 30px 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .company-section {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        
        .logo { 
          height: 70px; 
          width: auto;
          border-radius: 8px;
          background: #fff;
          padding: 4px;
        }
        .logo-placeholder { 
          height: 70px; 
          width: 70px; 
          background: rgba(99, 102, 241, 0.1);
          border-radius: 8px;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #6366f1;
          font-size: 24px;
          font-weight: bold;
        }
        
        .company-info {
          font-size: 11px;
        }
        .company-name { 
          font-weight: 600; 
          font-size: 16px; 
          margin-bottom: 4px;
          color: #1a1a1a;
        }
        .company-details {
          color: #666;
        }
        
        .offer-badge-section {
          text-align: right;
        }
        .offer-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #6366f1;
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
        }
        .offer-date {
          margin-top: 8px;
          color: #666;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }
        
        .content {
          padding: 30px 40px;
        }
        
        .client-section {
          margin-bottom: 24px;
        }
        .client-label {
          color: #666;
          font-size: 11px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .client-box {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
        }
        .client-name {
          font-weight: 500;
          margin-bottom: 4px;
        }
        .client-details {
          color: #666;
          font-size: 11px;
        }
        
        .predmet-section {
          margin-bottom: 20px;
          font-size: 11px;
        }
        .predmet-row {
          display: flex;
          margin-bottom: 6px;
        }
        .predmet-label {
          font-weight: bold;
          width: 80px;
        }
        
        .napomena {
          margin-bottom: 24px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
        }
        .napomena-title {
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 11px;
        }
        .napomena-text {
          color: #666;
          font-size: 11px;
          white-space: pre-wrap;
        }
        
        .items-section h3 {
          font-weight: 500;
          margin-bottom: 16px;
          font-size: 13px;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 11px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }
        thead tr {
          background: #f8f9fa;
        }
        th { 
          padding: 12px 8px; 
          text-align: left; 
          font-weight: 500;
          font-size: 11px;
          border-bottom: 1px solid #e0e0e0;
          color: #333;
        }
        th.text-center { text-align: center; }
        th.text-right { text-align: right; }
        
        .total-section {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }
        .total-box {
          background: rgba(99, 102, 241, 0.1);
          border-radius: 8px;
          padding: 16px 24px;
          text-align: right;
        }
        .total-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }
        .total-value {
          font-size: 20px;
          font-weight: bold;
          color: #6366f1;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
          font-size: 11px;
          color: #666;
        }
        
        @media print {
          @page { margin: 0; size: A4; }
          body { padding: 15mm; }
          
          /* Spriječi prijelom unutar redova tablice */
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Spriječi prijelom unutar važnih sekcija */
          .client-section,
          .napomena,
          .total-section,
          .footer {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Zaglavlje tablice ponavlja se na svakoj stranici */
          thead {
            display: table-header-group;
          }
          
          /* Tablica se može prelomiti između redova */
          table {
            page-break-inside: auto;
          }
          
          /* Stavke ponude uvijek počinju na novoj stranici */
          .items-section {
            page-break-before: always;
          }
          
          .header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .offer-badge, .total-box, .client-box, .napomena {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-section">
          ${company.logo_url 
            ? `<img src="${company.logo_url}" alt="Logo" class="logo" />`
            : `<div class="logo-placeholder">${company.naziv_firme.charAt(0)}</div>`
          }
          <div class="company-info">
            <div class="company-name">${company.naziv_firme}</div>
            <div class="company-details">
              <div>${company.adresa}</div>
              <div>OIB: ${company.oib}</div>
            </div>
          </div>
        </div>
        <div class="offer-badge-section">
          <div class="offer-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Ponuda ${offerNumber}
          </div>
          <div class="offer-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${formatDate(offer.created_at)}
          </div>
        </div>
      </div>

      <div class="content">
        <div class="client-section">
          <div class="client-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Klijent
          </div>
          <div class="client-box">
            <div class="client-name">${offer.client_naziv}</div>
            <div class="client-details">
              ${offer.client_oib ? `<div>OIB: ${offer.client_oib}</div>` : ''}
              ${offer.client_adresa ? `<div>${offer.client_adresa}</div>` : ''}
            </div>
          </div>
        </div>

        <div class="predmet-section">
          <div class="predmet-row">
            <span class="predmet-label">PREDMET:</span>
            <span><strong>PONUDA ${offerNumber}</strong></span>
          </div>
          <div class="predmet-row">
            <span class="predmet-label">KLIJENT:</span>
            <span>${offer.client_naziv}</span>
          </div>
        </div>

        ${offer.napomena ? `
          <div class="napomena">
            <div class="napomena-title">Napomena</div>
            <div class="napomena-text">${offer.napomena}</div>
          </div>
        ` : ''}

        <div class="items-section">
          <h3>Stavke ponude</h3>
          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 40px;">Br.</th>
                <th>Naziv</th>
                <th class="text-center" style="width: 50px;">Jed</th>
                <th class="text-center" style="width: 60px;">Kol</th>
                <th class="text-right" style="width: 100px;">Jed cijena</th>
                <th class="text-right" style="width: 100px;">Ukupno</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div class="total-box">
            <div class="total-label">Ukupno za platiti</div>
            <div class="total-value">${formatNumber(Number(offer.ukupno))} €</div>
          </div>
        </div>

        ${company.iban ? `
          <div class="footer">
            <div><strong>Način plaćanja:</strong> transakcijski račun</div>
            <div>IBAN: ${company.iban}</div>
            <div>Poziv na broj: ${offerNumber}</div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};