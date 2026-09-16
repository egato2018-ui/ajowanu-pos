import React, { useState, useRef } from 'react';
import { Sale, ShopSettings } from '../types';
import { formatFCFA, formatDateFR, formatDateTimeFR } from '../utils/formatters';
import { Printer, Download, X, CheckCircle, ShoppingBag, AlertCircle, Store, ShieldCheck, Barcode } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface InvoiceModalProps {
  sale: Sale | null;
  settings: ShopSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  sale,
  settings,
  isOpen,
  onClose,
}) => {
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>(settings.receiptType || 'thermal');
  const [printError, setPrintError] = useState<string | null>(null);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const currency = settings.currencySymbol || 'FCFA';

  const getPaymentModeLabel = (mode: string) => {
    switch (mode) {
      case 'Cash': return 'Espèces';
      case 'UPI': return 'Mobile Money / QR';
      case 'Card': return 'Carte bancaire';
      case 'Credit': return 'Crédit client';
      default: return mode;
    }
  };

  const handlePrint = () => {
    setPrintError(null);
    const elem = printableAreaRef.current || document.querySelector('.printable-area');
    if (!elem || !elem.innerHTML || elem.innerHTML.trim().length === 0) {
      setPrintError('Impossible de trouver le contenu du ticket à imprimer.');
      return;
    }

    try {
      window.focus();
      window.print();
    } catch (primaryErr: any) {
      try {
        let printFrame = document.getElementById('invoice-print-frame') as HTMLIFrameElement;
        if (!printFrame) {
          printFrame = document.createElement('iframe');
          printFrame.id = 'invoice-print-frame';
          printFrame.style.position = 'fixed';
          printFrame.style.right = '0';
          printFrame.style.bottom = '0';
          printFrame.style.width = '0';
          printFrame.style.height = '0';
          printFrame.style.border = '0';
          document.body.appendChild(printFrame);
        }

        const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
        if (frameDoc) {
          frameDoc.open();
          frameDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Facture - ${sale.invoiceNumber}</title>
                <style>
                  body { font-family: monospace, sans-serif; margin: 15px; color: #000; background: #fff; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { padding: 4px; text-align: left; }
                  .text-right { text-align: right; }
                  .text-center { text-align: center; }
                  .font-bold { font-weight: bold; }
                  .no-print { display: none !important; }
                </style>
              </head>
              <body>
                ${elem.innerHTML}
              </body>
            </html>
          `);
          frameDoc.close();

          setTimeout(() => {
            try {
              printFrame.contentWindow?.focus();
              printFrame.contentWindow?.print();
            } catch (fallbackErr: any) {
              setPrintError(`Impression bloquée par le navigateur : ${fallbackErr?.message || 'Erreur inconnue'}`);
            }
          }, 300);
        }
      } catch (err: any) {
        setPrintError(`Erreur lors de l'impression : ${err?.message || 'Erreur inconnue'}`);
      }
    }
  };

  const handleDownloadPDF = () => {
    setPrintError(null);
    if (!sale) return;

    try {
      const isThermal = printFormat === 'thermal';
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: isThermal ? [80, 220 + sale.items.length * 7] : 'a4',
      });

      const font = 'helvetica';
      let y = 10;

      if (isThermal) {
        doc.setFont(font, 'bold');
        doc.setFontSize(13);
        doc.text(settings.shopName || 'Boutique AJOWANU', 40, y, { align: 'center' });
        y += 5;

        doc.setFontSize(8);
        doc.setFont(font, 'normal');
        if (settings.address) { doc.text(settings.address, 40, y, { align: 'center' }); y += 4; }
        if (settings.phone) { doc.text(`Tél : ${settings.phone}`, 40, y, { align: 'center' }); y += 4; }
        if (settings.gstNumber) { doc.text(`IFU : ${settings.gstNumber}`, 40, y, { align: 'center' }); y += 4; }

        doc.setLineDashPattern([1, 1], 0);
        doc.line(5, y, 75, y);
        y += 4;

        doc.text(`Facture N° : ${sale.invoiceNumber}`, 5, y);
        y += 4;
        doc.text(`Date : ${formatDateTimeFR(sale.dateTime)}`, 5, y);
        y += 4;
        if (sale.customerName) {
          doc.text(`Client : ${sale.customerName}`, 5, y);
          y += 4;
        }

        doc.line(5, y, 75, y);
        y += 4;

        doc.setFont(font, 'bold');
        doc.text('Article', 5, y);
        doc.text('Qté x Prix', 45, y);
        doc.text('Total', 75, y, { align: 'right' });
        y += 4;

        doc.setFont(font, 'normal');
        sale.items.forEach(item => {
          const nameText = item.productName.length > 20 ? item.productName.substring(0, 18) + '..' : item.productName;
          doc.text(nameText, 5, y);
          doc.text(`${item.quantity} x ${item.unitSellingPrice}`, 45, y);
          doc.text(`${item.totalPrice} ${currency}`, 75, y, { align: 'right' });
          y += 4;
        });

        doc.line(5, y, 75, y);
        y += 4;

        doc.text(`Sous-total :`, 45, y);
        doc.text(`${sale.subtotal} ${currency}`, 75, y, { align: 'right' });
        y += 4;

        if (sale.discountAmount > 0) {
          doc.text(`Remise :`, 45, y);
          doc.text(`-${sale.discountAmount} ${currency}`, 75, y, { align: 'right' });
          y += 4;
        }

        if (sale.taxAmount > 0) {
          doc.text(`TVA (${sale.taxPercent}%) :`, 45, y);
          doc.text(`${sale.taxAmount.toFixed(0)} ${currency}`, 75, y, { align: 'right' });
          y += 4;
        }

        doc.setFont(font, 'bold');
        doc.setFontSize(10);
        doc.text(`TOTAL :`, 45, y);
        doc.text(`${sale.totalAmount} ${currency}`, 75, y, { align: 'right' });
        y += 5;

        doc.setFontSize(8);
        doc.setFont(font, 'normal');
        doc.text(`Règlement : ${getPaymentModeLabel(sale.paymentMode)}`, 5, y);
        if (sale.paymentMode === 'Cash' && sale.receivedAmount) {
          doc.text(`Reçu : ${sale.receivedAmount} | Rendu : ${sale.changeAmount}`, 75, y, { align: 'right' });
        }
        y += 6;

        doc.text('Merci de votre confiance ! À bientôt.', 40, y, { align: 'center' });
      } else {
        // A4 Format
        doc.setFont(font, 'bold');
        doc.setFontSize(18);
        doc.text(settings.shopName || 'Boutique AJOWANU', 15, y);
        y += 7;

        doc.setFontSize(9);
        doc.setFont(font, 'normal');
        if (settings.address) { doc.text(settings.address, 15, y); y += 4; }
        if (settings.phone) { doc.text(`Tél : ${settings.phone}`, 15, y); y += 4; }
        if (settings.gstNumber) { doc.text(`IFU : ${settings.gstNumber}`, 15, y); y += 4; }

        doc.setFont(font, 'bold');
        doc.setFontSize(15);
        doc.text('FACTURE DE VENTE', 195, 15, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont(font, 'normal');
        doc.text(`Facture N° : ${sale.invoiceNumber}`, 195, 22, { align: 'right' });
        doc.text(`Date : ${formatDateTimeFR(sale.dateTime)}`, 195, 27, { align: 'right' });

        y += 6;
        doc.line(15, y, 195, y);
        y += 8;

        if (sale.customerName) {
          doc.setFont(font, 'bold');
          doc.text('Informations Client :', 15, y);
          y += 4;
          doc.setFont(font, 'normal');
          doc.text(`Nom : ${sale.customerName}`, 15, y);
          if (sale.customerPhone) doc.text(`Téléphone : ${sale.customerPhone}`, 100, y);
          y += 8;
        }

        // Table Header
        doc.setFillColor(245, 243, 239);
        doc.rect(15, y, 180, 8, 'F');
        doc.setFont(font, 'bold');
        doc.text('N°', 18, y + 5.5);
        doc.text('Désignation Article', 30, y + 5.5);
        doc.text('Code-barres', 100, y + 5.5);
        doc.text('Prix Unit.', 130, y + 5.5);
        doc.text('Qté', 160, y + 5.5);
        doc.text('Total', 190, y + 5.5, { align: 'right' });
        y += 10;

        doc.setFont(font, 'normal');
        sale.items.forEach((item, idx) => {
          doc.text(`${idx + 1}`, 18, y);
          doc.text(item.productName.substring(0, 35), 30, y);
          doc.text(item.barcode || '-', 100, y);
          doc.text(`${item.unitSellingPrice} ${currency}`, 130, y);
          doc.text(`${item.quantity}`, 160, y);
          doc.text(`${item.totalPrice} ${currency}`, 190, y, { align: 'right' });
          y += 6;
        });

        y += 4;
        doc.line(15, y, 195, y);
        y += 8;

        doc.text(`Sous-total :`, 140, y);
        doc.text(`${sale.subtotal} ${currency}`, 190, y, { align: 'right' });
        y += 5;

        if (sale.discountAmount > 0) {
          doc.text(`Remise :`, 140, y);
          doc.text(`-${sale.discountAmount} ${currency}`, 190, y, { align: 'right' });
          y += 5;
        }

        if (sale.taxAmount > 0) {
          doc.text(`TVA (${sale.taxPercent}%) :`, 140, y);
          doc.text(`${sale.taxAmount.toFixed(0)} ${currency}`, 190, y, { align: 'right' });
          y += 5;
        }

        doc.setFont(font, 'bold');
        doc.setFontSize(12);
        doc.text(`NET À PAYER :`, 140, y);
        doc.text(`${sale.totalAmount} ${currency}`, 190, y, { align: 'right' });
        y += 10;

        doc.setFontSize(9);
        doc.setFont(font, 'normal');
        doc.text(`Mode de paiement : ${getPaymentModeLabel(sale.paymentMode)}`, 15, y);
        if (sale.paymentMode === 'Cash' && sale.receivedAmount) {
          doc.text(`Montant versé : ${sale.receivedAmount} ${currency} | Monnaie rendue : ${sale.changeAmount} ${currency}`, 15, y + 4);
        }

        doc.text('Cachet / Signature autorisée', 195, y + 15, { align: 'right' });
      }

      doc.save(`${sale.invoiceNumber}.pdf`);
    } catch (pdfErr: any) {
      setPrintError(`Erreur lors de la création du PDF : ${pdfErr?.message || 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#ECE5D7] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150 my-auto">
        
        {/* Modal Top Toolbar */}
        <div className="no-print flex items-center justify-between p-4 border-b border-[#ECE5D7] bg-[#F6F1E7]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Facture {sale.invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Vente enregistrée avec succès • {formatDateTimeFR(sale.dateTime)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Receipt format toggle */}
            <div className="bg-white border border-[#ECE5D7] p-0.5 rounded-xl flex text-xs font-medium">
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  printFormat === 'thermal'
                    ? 'bg-[#123F46] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ticket (80mm)
              </button>
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  printFormat === 'a4'
                    ? 'bg-[#123F46] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Format A4
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-[#FAF7F2] flex justify-center">
          <div
            ref={printableAreaRef}
            className={`printable-area w-full bg-white text-slate-800 shadow-md border border-[#E7DECD] ${
              printFormat === 'thermal'
                ? 'max-w-[360px] p-5 rounded-2xl text-xs font-mono select-none'
                : 'max-w-2xl p-8 rounded-2xl text-sm font-sans'
            }`}
          >
            {printFormat === 'thermal' ? (
              /* --- FORMAT TICKET DE CAISSE THERMIQUE 80MM --- */
              <div className="space-y-3.5">
                {/* En-tête Boutique */}
                <div className="text-center pb-3 border-b border-dashed border-slate-300">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#F6F1E7] text-[#D85C3A] mb-1.5 no-print">
                    <Store className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-base text-slate-900 uppercase tracking-wide leading-tight">
                    {settings.shopName}
                  </h2>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{settings.address}</p>
                  <div className="mt-1 flex flex-wrap justify-center items-center gap-x-2 text-[10px] text-slate-500 font-medium">
                    {settings.phone && <span>Tél : <strong className="text-slate-700">{settings.phone}</strong></span>}
                    {settings.gstNumber && <span>• IFU : <strong className="text-slate-700">{settings.gstNumber}</strong></span>}
                  </div>
                </div>

                {/* Métadonnées Facture & Date */}
                <div className="py-1 border-b border-dashed border-slate-300 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ticket N° :</span>
                    <span className="font-bold text-slate-900 font-mono tracking-wider">{sale.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Date & Heure :</span>
                    <span className="text-slate-800 font-medium">
                      {formatDateFR(sale.dateTime)} • {new Date(sale.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Client :</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {sale.customerName ? `${sale.customerName}${sale.customerPhone ? ` (${sale.customerPhone})` : ''}` : 'Client de passage'}
                    </span>
                  </div>
                </div>

                {/* Liste des Articles Épurée & Alignée */}
                <div className="py-1 border-b border-dashed border-slate-300 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-0.5">
                    <span>Désignation / Qté x P.U</span>
                    <span>Montant</span>
                  </div>
                  <div className="space-y-2">
                    {sale.items.map((item, i) => (
                      <div key={i} className="text-xs">
                        <div className="font-bold text-slate-900 leading-tight">
                          {item.productName}
                        </div>
                        <div className="flex justify-between items-baseline text-[11px] text-slate-600 mt-0.5">
                          <span className="font-mono text-slate-500">
                            {item.quantity} × {formatFCFA(item.unitSellingPrice, currency)}
                          </span>
                          <span className="font-bold text-slate-900 font-mono-data">
                            {formatFCFA(item.totalPrice, currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculs Financiers */}
                <div className="py-1 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Sous-total ({sale.items.reduce((acc, it) => acc + it.quantity, 0)} art.)</span>
                    <span className="font-mono-data font-medium text-slate-800">{formatFCFA(sale.subtotal, currency)}</span>
                  </div>

                  {sale.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-[#D85C3A]">
                      <span>Remise accordée</span>
                      <span className="font-mono-data font-bold">-{formatFCFA(sale.discountAmount, currency)}</span>
                    </div>
                  )}

                  {sale.taxAmount > 0 && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>TVA légale ({sale.taxPercent}%)</span>
                      <span className="font-mono-data font-medium">{formatFCFA(sale.taxAmount, currency)}</span>
                    </div>
                  )}

                  {/* Grand Total Net à Payer */}
                  <div className="mt-2 py-2 px-3 bg-[#FAF7F2] border-y-2 border-slate-900 flex justify-between items-baseline">
                    <span className="font-black text-xs text-slate-900 tracking-wider uppercase">
                      NET À PAYER
                    </span>
                    <span className="font-black text-base text-slate-900 font-mono-data tracking-tight">
                      {formatFCFA(sale.totalAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Règlement & Rendu Monnaie */}
                <div className="p-2.5 rounded-xl bg-[#F6F1E7] text-[11px] text-slate-700 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Règlement :</span>
                    <span className="font-bold text-slate-900">{getPaymentModeLabel(sale.paymentMode)}</span>
                  </div>
                  {sale.paymentMode === 'Cash' && sale.receivedAmount > 0 && (
                    <>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Montant versé :</span>
                        <span className="font-mono-data">{formatFCFA(sale.receivedAmount, currency)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-[#123F46] pt-0.5 border-t border-slate-200/60">
                        <span>Monnaie rendue :</span>
                        <span className="font-mono-data">{formatFCFA(sale.changeAmount, currency)}</span>
                      </div>
                    </>
                  )}
                  {sale.paymentMode === 'UPI' && (
                    <div className="flex items-center gap-1.5 text-[#123F46] font-bold text-[10px] pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Règlement Mobile Money validé</span>
                    </div>
                  )}
                </div>

                {/* Code-barres de certification */}
                <div className="pt-2 text-center border-t border-dashed border-slate-300">
                  <div className="flex justify-center items-center gap-[2px] h-9 mb-1 text-slate-800">
                    {/* Simulated barcode SVG stripes */}
                    <div className="w-[2px] h-full bg-slate-900"></div>
                    <div className="w-[1px] h-full bg-white"></div>
                    <div className="w-[3px] h-full bg-slate-900"></div>
                    <div className="w-[2px] h-full bg-white"></div>
                    <div className="w-[1px] h-full bg-slate-900"></div>
                    <div className="w-[3px] h-full bg-white"></div>
                    <div className="w-[2px] h-full bg-slate-900"></div>
                    <div className="w-[1px] h-full bg-white"></div>
                    <div className="w-[4px] h-full bg-slate-900"></div>
                    <div className="w-[2px] h-full bg-white"></div>
                    <div className="w-[2px] h-full bg-slate-900"></div>
                    <div className="w-[1px] h-full bg-white"></div>
                    <div className="w-[3px] h-full bg-slate-900"></div>
                    <div className="w-[2px] h-full bg-white"></div>
                    <div className="w-[1px] h-full bg-slate-900"></div>
                    <div className="w-[3px] h-full bg-white"></div>
                    <div className="w-[2px] h-full bg-slate-900"></div>
                    <div className="w-[4px] h-full bg-slate-900"></div>
                    <div className="w-[1px] h-full bg-white"></div>
                    <div className="w-[2px] h-full bg-slate-900"></div>
                    <div className="w-[3px] h-full bg-white"></div>
                    <div className="w-[1px] h-full bg-slate-900"></div>
                    <div className="w-[2px] h-full bg-white"></div>
                    <div className="w-[3px] h-full bg-slate-900"></div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono tracking-widest">{sale.invoiceNumber}</div>
                </div>

                {/* Bas de ticket */}
                <div className="text-center pt-1 text-[10px] text-slate-500 space-y-0.5">
                  <p className="font-bold text-slate-700">*** MERCI DE VOTRE VISITE ! ***</p>
                  <p className="text-slate-400 text-[9px]">Conservez ce ticket en cas d'échange sous 48h</p>
                  <p className="text-slate-400 text-[9px] pt-1">AJOWANU POS • Système Certifié</p>
                </div>
              </div>
            ) : (
              /* --- FORMAT FACTURE COMMERCIALE A4 --- */
              <div className="space-y-6">
                {/* En-tête Facture A4 */}
                <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#D85C3A] text-white flex items-center justify-center font-bold">
                        A
                      </div>
                      <h1 className="text-xl font-black text-slate-900">{settings.shopName}</h1>
                    </div>
                    <p className="text-xs text-slate-600 max-w-sm">{settings.address}</p>
                    <p className="text-xs text-slate-600 mt-1">Tél : {settings.phone || 'Non renseigné'}</p>
                    {settings.gstNumber && <p className="text-xs text-slate-600 font-medium">N° IFU : {settings.gstNumber}</p>}
                  </div>

                  <div className="text-right bg-[#FAF7F2] p-4 rounded-xl border border-[#ECE5D7]">
                    <span className="text-[11px] font-bold text-[#D85C3A] tracking-wider uppercase block mb-1">
                      FACTURE CLIENT
                    </span>
                    <span className="text-lg font-black font-mono text-slate-900 block">
                      {sale.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Date : {formatDateFR(sale.dateTime)}
                    </span>
                  </div>
                </div>

                {/* Destinataire Client */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Facturé à :
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{sale.customerName || 'Client Comptant'}</p>
                    {sale.customerPhone && <p className="text-slate-600 mt-0.5">Contact : {sale.customerPhone}</p>}
                    <p className="text-slate-500 text-[11px] mt-1">Modalité : Règlement immédiat</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Détails de caisse :
                    </span>
                    <p className="text-slate-700">Mode de paiement : <strong>{getPaymentModeLabel(sale.paymentMode)}</strong></p>
                    <p className="text-slate-600 mt-0.5">Heure d'édition : {new Date(sale.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-emerald-700 font-medium text-[11px] mt-1">Statut : Facture acquittée</p>
                  </div>
                </div>

                {/* Tableau comptable A4 */}
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">N°</th>
                        <th className="py-2.5 px-3">Désignation de l'Article</th>
                        <th className="py-2.5 px-3 text-center">Quantité</th>
                        <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                        <th className="py-2.5 px-3 text-right">Total Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sale.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-slate-400 font-mono">{i + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{item.productName}</td>
                          <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono-data">{formatFCFA(item.unitSellingPrice, currency)}</td>
                          <td className="py-2 px-3 text-right font-bold font-mono-data text-slate-900">{formatFCFA(item.totalPrice, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Synthèse Totaux & Signatures */}
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="text-xs text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700">Conditions générales de vente :</p>
                    <p className="text-[11px] leading-relaxed">
                      Marchandise vendue certifiée conforme. Tout retour doit s'effectuer sous 48 heures ouvrables sur présentation de la présente facture.
                    </p>
                    <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Signature & Cachet Magasin</span>
                      <span>Signature Client</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Sous-total HT</span>
                      <span className="font-mono-data font-medium">{formatFCFA(sale.subtotal, currency)}</span>
                    </div>
                    {sale.discountAmount > 0 && (
                      <div className="flex justify-between text-[#D85C3A] font-medium">
                        <span>Remise commerciale</span>
                        <span className="font-mono-data">-{formatFCFA(sale.discountAmount, currency)}</span>
                      </div>
                    )}
                    {sale.taxAmount > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>TVA ({sale.taxPercent}%)</span>
                        <span className="font-mono-data font-medium">{formatFCFA(sale.taxAmount, currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                      <span>TOTAL NET À PAYER</span>
                      <span className="font-mono-data text-[#D85C3A] text-base">{formatFCFA(sale.totalAmount, currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Pied de page A4 */}
                <div className="text-center pt-6 border-t border-slate-200 text-[11px] text-slate-400">
                  AJOWANU — Plateforme de Gestion Commerciale • {settings.shopName} • IFU : {settings.gstNumber || '3202100000000'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="no-print p-4 bg-[#F6F1E7] border-t border-[#ECE5D7] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Facture enregistrée dans la base locale sécurisée.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-medium text-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Enregistrer PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#D85C3A] hover:bg-[#C24B2B] text-white rounded-xl font-medium text-sm flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le Reçu</span>
            </button>
          </div>
        </div>

      </div>

      {printError && (
        <div className="fixed inset-0 z-60 bg-[#111827]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-rose-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-7 h-7 shrink-0" />
              <h4 className="text-base font-bold">Information d'impression</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {printError}
            </p>
            <div className="p-3 bg-[#F6F1E7] rounded-xl text-[11px] text-slate-600 font-mono leading-normal">
              Astuce : Vous pouvez utiliser le bouton "Enregistrer PDF" pour télécharger la facture.
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setPrintError(null)}
                className="px-4 py-2 bg-[#111827] text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
