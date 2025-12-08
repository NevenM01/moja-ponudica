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
  kolicina: number;
  cijena: number;
  ukupno: number;
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

export const generatePDF = (offer: Offer, items: OfferItem[], company: CompanyProfile) => {
  const offerNumber = offer.offer_number.split('-').pop() || offer.offer_number;

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e5e5;">${item.opis}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e5e5; text-align: center;">${Number(item.kolicina)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatNumber(Number(item.cijena))}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 500;">${formatNumber(Number(item.ukupno))}</td>
      </tr>
    `
    )
    .join('');

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
          padding: 40px; 
          color: #1a1a1a; 
          font-size: 14px;
          line-height: 1.5;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e5e5;
          margin-bottom: 24px;
        }
        .logo { height: 60px; width: auto; }
        .logo-placeholder { 
          height: 60px; 
          width: 120px; 
          background: #f5f5f5; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #999;
          border-radius: 4px;
        }
        .company-info { text-align: right; font-size: 13px; }
        .company-name { font-weight: bold; font-size: 16px; margin-bottom: 4px; }
        .text-muted { color: #666; }
        
        .client-section {
          display: flex;
          justify-content: space-between;
          padding: 24px 0;
          border-bottom: 1px solid #e5e5e5;
          margin-bottom: 32px;
        }
        .client-info { font-size: 13px; }
        .client-label { color: #666; margin-bottom: 4px; }
        .client-name { font-weight: bold; font-size: 15px; margin-bottom: 4px; }
        .date-info { text-align: right; font-size: 13px; color: #666; }
        
        .offer-title { 
          text-align: center; 
          font-size: 28px; 
          font-weight: bold; 
          margin: 32px 0;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 24px; 
        }
        thead tr {
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
        }
        th { 
          padding: 12px 8px; 
          text-align: left; 
          font-weight: bold;
          font-size: 14px;
        }
        th.text-center { text-align: center; }
        th.text-right { text-align: right; }
        
        .totals {
          border-top: 2px solid #333;
          padding-top: 16px;
          margin-top: 16px;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
        }
        .total-label { width: 150px; text-align: left; color: #666; }
        .total-value { width: 120px; text-align: right; font-weight: 500; }
        .grand-total {
          border-top: 1px solid #e5e5e5;
          padding-top: 8px;
          margin-top: 8px;
        }
        .grand-total .total-label,
        .grand-total .total-value { font-weight: bold; color: #1a1a1a; }
        
        .note { 
          border-top: 1px solid #e5e5e5; 
          padding-top: 24px; 
          margin-top: 32px; 
        }
        .note-label { color: #666; margin-bottom: 8px; }
        
        .footer { 
          display: flex;
          justify-content: space-between;
          margin-top: 48px; 
          padding-top: 24px; 
          border-top: 1px solid #e5e5e5; 
          font-size: 12px; 
          color: #666; 
        }
        
        @media print {
          body { padding: 20px; }
          @page { margin: 20mm; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            ${company.logo_url 
              ? `<img src="${company.logo_url}" alt="Logo" class="logo" />`
              : '<div class="logo-placeholder">Logo</div>'
            }
          </div>
          <div class="company-info">
            <div class="company-name">${company.naziv_firme}</div>
            <div class="text-muted">${company.adresa}</div>
            <div class="text-muted">OIB: ${company.oib}</div>
            ${company.telefon ? `<div class="text-muted">Tel: ${company.telefon}</div>` : ''}
            ${company.email ? `<div class="text-muted">${company.email}</div>` : ''}
          </div>
        </div>

        <div class="client-section">
          <div class="client-info">
            <div class="client-label">Kupac:</div>
            <div class="client-name">${offer.client_naziv}</div>
            ${offer.client_adresa ? `<div class="text-muted">${offer.client_adresa}</div>` : ''}
            ${offer.client_oib ? `<div class="text-muted">OIB: ${offer.client_oib}</div>` : ''}
          </div>
          <div class="date-info">
            <div>Datum ponude: ${format(new Date(offer.created_at), 'dd.MM.yyyy.')}</div>
          </div>
        </div>

        <div class="offer-title">Ponuda # ${offerNumber}</div>

        <table>
          <thead>
            <tr>
              <th>Naziv</th>
              <th class="text-center">Količina</th>
              <th class="text-right">Cijena</th>
              <th class="text-right">Ukupno</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span class="total-label">Ukupno:</span>
            <span class="total-value">${formatNumber(Number(offer.ukupno))} €</span>
          </div>
          <div class="total-row grand-total">
            <span class="total-label">Ukupno za platiti:</span>
            <span class="total-value">${formatNumber(Number(offer.ukupno))} €</span>
          </div>
        </div>

        ${offer.napomena ? `
          <div class="note">
            <div class="note-label">Napomena:</div>
            <p>${offer.napomena}</p>
          </div>
        ` : ''}

        ${company.iban ? `
          <div class="footer">
            <div>Način plaćanja: transakcijski račun</div>
            <div>IBAN: ${company.iban}</div>
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