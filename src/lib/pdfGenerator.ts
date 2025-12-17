import { format } from 'date-fns';

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

export const generatePDF = (
  offer: Offer,
  items: OfferItem[],
  company: CompanyProfile,
  groups?: OfferGroup[]
) => {
  const offerNumber = offer.offer_number;

  // Generate items HTML, grouped if groups exist
  let itemsHtml = '';
  let itemCounter = 1;

  if (groups && groups.length > 0) {
    groups.sort((a, b) => a.redni_broj - b.redni_broj);
    
    groups.forEach((group) => {
      const groupItems = items.filter(item => item.group_id === group.id);
      
      if (groupItems.length > 0 || group.naziv) {
        // Group header
        itemsHtml += `
          <tr>
            <td colspan="6" style="padding: 12px 8px 8px; font-weight: bold; font-size: 12px; background: #f5f5f5; border-bottom: 2px solid #333;">
              ${group.redni_broj}. ${group.naziv}
            </td>
          </tr>
        `;
        
        // Group items
        groupItems.forEach((item) => {
          itemsHtml += `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; width: 40px;">${itemCounter}.</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.opis}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; width: 50px;">${item.jedinica || 'kom'}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; width: 60px;">${Number(item.kolicina)}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; width: 100px;">${formatNumber(Number(item.cijena))}</td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; width: 100px; font-weight: 500;">${formatNumber(Number(item.ukupno))}</td>
            </tr>
          `;
          itemCounter++;
        });
      }
    });
  } else {
    // No groups - flat items
    items.forEach((item, index) => {
      itemsHtml += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; width: 40px;">${index + 1}.</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.opis}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; width: 50px;">${item.jedinica || 'kom'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; width: 60px;">${Number(item.kolicina)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; width: 100px;">${formatNumber(Number(item.cijena))}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; width: 100px; font-weight: 500;">${formatNumber(Number(item.ukupno))}</td>
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
          font-family: Arial, sans-serif; 
          padding: 30px 40px; 
          color: #333; 
          font-size: 11px;
          line-height: 1.4;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
          margin-bottom: 20px;
        }
        .logo { height: 80px; width: auto; }
        .logo-placeholder { 
          height: 80px; 
          width: 160px; 
          background: #f5f5f5; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #999;
          font-size: 12px;
        }
        .company-info { text-align: right; font-size: 10px; }
        .company-name { font-weight: bold; font-size: 14px; margin-bottom: 3px; }
        
        .predmet-section {
          margin: 20px 0;
          font-size: 11px;
        }
        .predmet-row {
          display: flex;
          margin-bottom: 8px;
        }
        .predmet-label {
          font-weight: bold;
          width: 80px;
        }
        .predmet-value {
          flex: 1;
        }
        
        .client-section {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border: 1px solid #ddd;
        }
        .client-label { font-weight: bold; margin-bottom: 5px; }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
          font-size: 10px;
        }
        thead tr {
          background: #f0f0f0;
        }
        th { 
          padding: 10px 8px; 
          text-align: left; 
          font-weight: bold;
          font-size: 10px;
          border-bottom: 2px solid #333;
          border-top: 2px solid #333;
        }
        th.text-center { text-align: center; }
        th.text-right { text-align: right; }
        
        .rekapitulacija {
          margin-top: 30px;
          border-top: 2px solid #333;
          padding-top: 15px;
        }
        .rekapitulacija-title {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 10px;
          text-decoration: underline;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #ddd;
        }
        .total-row.grand-total {
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          font-weight: bold;
          font-size: 13px;
          margin-top: 10px;
          padding: 12px 0;
        }
        
        .napomena { 
          margin-top: 30px;
          padding: 15px;
          background: #f9f9f9;
          border: 1px solid #ddd;
          font-size: 10px;
        }
        .napomena-title {
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .footer { 
          margin-top: 40px; 
          display: flex;
          justify-content: space-between;
          font-size: 10px;
        }
        .footer-left {
          max-width: 60%;
        }
        .footer-right {
          text-align: right;
        }
        .signature-line {
          margin-top: 40px;
          border-top: 1px solid #333;
          width: 200px;
          text-align: center;
          padding-top: 5px;
          font-size: 10px;
        }
        
        @media print {
          body { padding: 15px; }
          @page { margin: 15mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          ${company.logo_url 
            ? `<img src="${company.logo_url}" alt="Logo" class="logo" />`
            : `<div class="logo-placeholder">${company.naziv_firme.substring(0, 10)}</div>`
          }
        </div>
        <div class="company-info">
          <div class="company-name">${company.naziv_firme}</div>
          <div>${company.adresa}</div>
          <div>OIB: ${company.oib}</div>
          ${company.telefon ? `<div>Tel: ${company.telefon}</div>` : ''}
          ${company.email ? `<div>${company.email}</div>` : ''}
          ${company.iban ? `<div>IBAN: ${company.iban}</div>` : ''}
        </div>
      </div>

      <div class="predmet-section">
        <div class="predmet-row">
          <span class="predmet-label">PREDMET:</span>
          <span class="predmet-value"><strong>PONUDA ${offerNumber}</strong></span>
        </div>
        <div class="predmet-row">
          <span class="predmet-label">KLIJENT:</span>
          <span class="predmet-value">${offer.client_naziv}</span>
        </div>
      </div>

      <div class="client-section">
        <div class="client-label">Podaci o klijentu:</div>
        <div><strong>${offer.client_naziv}</strong></div>
        ${offer.client_adresa ? `<div>${offer.client_adresa}</div>` : ''}
        ${offer.client_oib ? `<div>OIB: ${offer.client_oib}</div>` : ''}
      </div>

      ${offer.napomena ? `
        <div class="napomena">
          <div class="napomena-title">Napomena:</div>
          <div>${offer.napomena}</div>
        </div>
      ` : ''}

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

      <div class="rekapitulacija">
        <div class="total-row grand-total">
          <span>SVEUKUPNO:</span>
          <span>${formatNumber(Number(offer.ukupno))} €</span>
        </div>
      </div>

      <div class="footer">
        <div class="footer-left">
          ${company.iban ? `
            <div><strong>Način plaćanja:</strong> transakcijski račun</div>
            <div>IBAN: ${company.iban}</div>
            <div>Poziv na broj: ${offerNumber}</div>
          ` : ''}
        </div>
        <div class="footer-right">
          <div>Datum: ${format(new Date(offer.created_at), 'dd.MM.yyyy.')}</div>
          <div class="signature-line">
            Za ${company.naziv_firme}
          </div>
        </div>
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
