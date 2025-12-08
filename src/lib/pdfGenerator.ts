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

export const generatePDF = (offer: Offer, items: OfferItem[], company: CompanyProfile) => {
  const itemsHtml = items
    .map(
      (item, index) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.opis}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${Number(item.kolicina).toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${Number(item.cijena).toFixed(2)} €</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${Number(item.ukupno).toFixed(2)} €</td>
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
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .company-info { font-size: 14px; }
        .company-name { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
        .offer-title { font-size: 24px; font-weight: bold; text-align: center; margin: 40px 0; }
        .client-box { background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .client-box h3 { margin: 0 0 8px 0; font-size: 14px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #333; color: white; padding: 12px 8px; text-align: left; }
        th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
        .total { text-align: right; font-size: 20px; font-weight: bold; margin: 24px 0; }
        .note { border-top: 1px solid #ddd; padding-top: 16px; margin-top: 24px; }
        .note-label { font-weight: bold; color: #666; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${company.naziv_firme}</div>
          <div>OIB: ${company.oib}</div>
          <div>${company.adresa}</div>
          ${company.email ? `<div>Email: ${company.email}</div>` : ''}
          ${company.telefon ? `<div>Tel: ${company.telefon}</div>` : ''}
          ${company.iban ? `<div>IBAN: ${company.iban}</div>` : ''}
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #666;">Datum:</div>
          <div style="font-weight: bold;">${format(new Date(offer.created_at), 'dd.MM.yyyy.')}</div>
        </div>
      </div>

      <div class="offer-title">PONUDA ${offer.offer_number}</div>

      <div class="client-box">
        <h3>KLIJENT</h3>
        <div style="font-weight: bold;">${offer.client_naziv}</div>
        ${offer.client_oib ? `<div>OIB: ${offer.client_oib}</div>` : ''}
        ${offer.client_adresa ? `<div>${offer.client_adresa}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Opis</th>
            <th style="width: 100px;">Količina</th>
            <th style="width: 100px;">Cijena</th>
            <th style="width: 120px;">Ukupno</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total">UKUPNO: ${Number(offer.ukupno).toFixed(2)} €</div>

      ${
        offer.napomena
          ? `
        <div class="note">
          <span class="note-label">Napomena:</span>
          <p>${offer.napomena}</p>
        </div>
      `
          : ''
      }

      <div class="footer">
        <p>Hvala na povjerenju!</p>
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
