import React, { useState, useEffect, useRef } from 'react';
import { Product, ShopSettings } from '../types';
import { Barcode as BarcodeIcon, Printer, Tag, Sparkles } from 'lucide-react';
import { formatFCFA } from '../utils/formatters';
import JsBarcode from 'jsbarcode';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface BarcodeGeneratorViewProps {
  products: Product[];
  selectedProductForLabel: Product | null;
  settings: ShopSettings;
}

const StickerItem: React.FC<{
  shopName: string;
  name: string;
  barcode: string;
  price: number | string;
  currency: string;
}> = ({ shopName, name, barcode, price, currency }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && barcode) {
      try {
        JsBarcode(svgRef.current, barcode, {
          format: 'CODE128',
          width: 1.2,
          height: 32,
          displayValue: true,
          fontSize: 9,
          margin: 2,
        });
      } catch (err) {
        console.error('Barcode error', err);
      }
    }
  }, [barcode]);

  return (
    <div className="p-3 bg-white text-black rounded-xl border border-slate-300 shadow-2xs text-center font-sans text-xs flex flex-col justify-between break-inside-avoid">
      <div>
        <p className="font-black text-[10px] text-[#123F46] tracking-tight uppercase truncate">{shopName}</p>
        <p className="font-bold text-[11px] text-slate-900 truncate leading-tight mt-0.5">{name}</p>
      </div>

      <div className="my-1.5 flex justify-center">
        <svg ref={svgRef} className="max-w-full h-auto" />
      </div>

      <p className="font-black text-xs font-mono-data text-[#D85C3A]">
        PRIX : {formatFCFA(typeof price === 'number' ? price : parseFloat(price) || 0, currency)}
      </p>
    </div>
  );
};

export const BarcodeGeneratorView: React.FC<BarcodeGeneratorViewProps> = ({
  products,
  selectedProductForLabel,
  settings,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    selectedProductForLabel ? selectedProductForLabel.id : (products[0]?.id || '')
  );
  
  const [customBarcode, setCustomBarcode] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [copies, setCopies] = useState<number>(12);

  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const currency = settings.currencySymbol || 'FCFA';

  const activeProduct = products.find(p => p.id === selectedProductId);

  const displayBarcode = activeProduct ? activeProduct.barcode : (customBarcode || '229000123456');
  const displayName = activeProduct ? activeProduct.name : (customName || 'Exemple Article Épicerie');
  const displayPrice = activeProduct ? activeProduct.sellingPrice : (parseFloat(customPrice) || 1000);

  useEffect(() => {
    if (selectedProductForLabel) {
      setSelectedProductId(selectedProductForLabel.id);
    }
  }, [selectedProductForLabel]);

  useEffect(() => {
    if (barcodeSvgRef.current && displayBarcode) {
      try {
        JsBarcode(barcodeSvgRef.current, displayBarcode, {
          format: 'CODE128',
          width: 1.8,
          height: 45,
          displayValue: true,
          fontSize: 12,
          margin: 5,
        });
      } catch (err) {
        console.error('Barcode rendering error', err);
      }
    }
  }, [displayBarcode, selectedProductId]);

  const handlePrintLabels = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Standard window.print failed, attempting popup print:', err);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const stickersHtml = Array.from({ length: copies }).map(() => `
          <div style="
            width: 58mm;
            height: 38mm;
            padding: 3mm;
            border: 1px solid #000;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            text-align: center;
            font-family: Arial, sans-serif;
            background: #fff;
            color: #000;
            page-break-inside: avoid;
          ">
            <div style="font-size: 10px; font-weight: bold; text-transform: uppercase;">${settings.shopName || 'AJOWANU STORE'}</div>
            <div style="font-size: 11px; font-weight: 600; margin: 2px 0;">${displayName}</div>
            <svg class="barcode-svg" data-code="${displayBarcode}"></svg>
            <div style="font-size: 11px; font-weight: bold; font-family: monospace;">PRIX : ${formatFCFA(displayPrice, currency)}</div>
          </div>
        `).join('');

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Impression Planche Codes-Barres AJOWANU</title>
              <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
              <style>
                @page { margin: 10mm; }
                body { font-family: sans-serif; margin: 0; background: #fff; }
                .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
              </style>
            </head>
            <body>
              <div class="grid">${stickersHtml}</div>
              <script>
                document.querySelectorAll('.barcode-svg').forEach(el => {
                  JsBarcode(el, el.getAttribute('data-code'), { format: 'CODE128', width: 1.2, height: 30, displayValue: true, fontSize: 9 });
                });
                setTimeout(() => { window.print(); window.close(); }, 500);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="p-5 sm:p-7 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Générateur d'Étiquettes & Codes-Barres"
        subtitle="Créez et imprimez des planches d'étiquettes adhésives pour les articles en vrac ou non pré-codés."
        icon={<BarcodeIcon className="w-5 h-5 text-[#D85C3A]" />}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrintLabels}
          >
            Imprimer la Planche ({copies} Étiquettes)
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs space-y-5">
          <div className="border-b border-[#ECE5D7] pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              Paramétrage du Code-Barres
            </h3>
            <p className="text-[11px] text-slate-400">Sélectionnez un produit ou composez une étiquette libre</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Article du Stock
            </label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-[#D85C3A] text-slate-900"
            >
              <option value="">-- Saisie Manuelle Libre --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatFCFA(p.sellingPrice, currency)} - Code : {p.barcode})
                </option>
              ))}
            </select>
          </div>

          {!selectedProductId && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom de l'Article
                </label>
                <input
                  type="text"
                  placeholder="Ex : Riz Blanc Brisure 1kg"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#D85C3A] text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Numéro Code-Barres
                  </label>
                  <input
                    type="text"
                    placeholder="229000123456"
                    value={customBarcode}
                    onChange={e => setCustomBarcode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#D85C3A] text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prix de Vente ({currency})
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={customPrice}
                    onChange={e => setCustomPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-mono-data focus:outline-none focus:border-[#D85C3A] text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Format de la Planche A4
            </label>
            <select
              value={copies}
              onChange={e => setCopies(parseInt(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
            >
              <option value={6}>6 Étiquettes par feuille (Grand format)</option>
              <option value={12}>12 Étiquettes par feuille (Standard commerce)</option>
              <option value={24}>24 Étiquettes par feuille (Compact)</option>
              <option value={40}>40 Étiquettes par feuille (Petits conditionnements)</option>
            </select>
          </div>

          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7] text-center space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aperçu Réel de l'Étiquette</span>
            <div className="p-3.5 bg-white text-black rounded-xl border border-slate-300 max-w-[220px] mx-auto shadow-xs text-center font-sans">
              <p className="font-black text-xs truncate text-[#123F46] uppercase">{settings.shopName || 'AJOWANU'}</p>
              <p className="text-[11px] font-bold text-slate-900 truncate leading-tight mt-0.5">{displayName}</p>
              <div className="my-1.5 flex justify-center">
                <svg ref={barcodeSvgRef} />
              </div>
              <p className="font-black text-xs font-mono-data text-[#D85C3A]">PRIX : {formatFCFA(displayPrice, currency)}</p>
            </div>
          </div>
        </div>

        {/* Right Preview Sheet (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#ECE5D7] shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#ECE5D7] pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Planche d'Impression ({copies} Étiquettes)
              </h3>
              <p className="text-[11px] text-slate-400">Disposition sur feuille A4 ou rouleau d'étiquettes adhésives</p>
            </div>
            <Badge variant="teal" size="sm">Format A4 Prêt</Badge>
          </div>

          <div className="printable-area p-4 bg-[#FAF8F5] rounded-xl border border-[#ECE5D7] min-h-[400px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: copies }).map((_, idx) => (
                <StickerItem
                  key={idx}
                  shopName={settings.shopName || 'AJOWANU'}
                  name={displayName}
                  barcode={displayBarcode}
                  price={displayPrice}
                  currency={currency}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
