import React, { useState } from 'react';
import { X, RotateCcw, Copy, Check, Banknote, Coins } from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';

interface CashCounterPopoverProps {
  onClose: () => void;
  currency?: string;
}

interface Denomination {
  value: number;
  label: string;
  type: 'note' | 'coin';
}

const FCFA_DENOMINATIONS: Denomination[] = [
  { value: 10000, label: '10 000 Billet', type: 'note' },
  { value: 5000, label: '5 000 Billet', type: 'note' },
  { value: 2000, label: '2 000 Billet', type: 'note' },
  { value: 1000, label: '1 000 Billet', type: 'note' },
  { value: 500, label: '500 Billet', type: 'note' },
  { value: 500, label: '500 Pièce', type: 'coin' },
  { value: 200, label: '200 Pièce', type: 'coin' },
  { value: 100, label: '100 Pièce', type: 'coin' },
  { value: 50, label: '50 Pièce', type: 'coin' },
  { value: 25, label: '25 Pièce', type: 'coin' },
];

export const CashCounterPopover: React.FC<CashCounterPopoverProps> = ({ onClose, currency = 'FCFA' }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);

  const handleQtyChange = (key: string, val: string) => {
    const num = parseInt(val, 10);
    setQuantities(prev => ({
      ...prev,
      [key]: isNaN(num) || num < 0 ? 0 : num
    }));
  };

  const handleReset = () => {
    setQuantities({});
  };

  const totalAmount = FCFA_DENOMINATIONS.reduce((acc, d, index) => {
    const key = `${d.value}_${d.type}_${index}`;
    const qty = quantities[key] || 0;
    return acc + (d.value * qty);
  }, 0);

  const totalNotesCount = FCFA_DENOMINATIONS.filter(d => d.type === 'note').reduce((acc, d, index) => {
    const key = `${d.value}_${d.type}_${index}`;
    return acc + (quantities[key] || 0);
  }, 0);

  const totalCoinsCount = FCFA_DENOMINATIONS.filter(d => d.type === 'coin').reduce((acc, d, index) => {
    const key = `${d.value}_${d.type}_${index}`;
    return acc + (quantities[key] || 0);
  }, 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${totalAmount} ${currency}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#ECE5D7] p-4 z-50 animate-in fade-in zoom-in-95 duration-150 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#ECE5D7]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center text-[#123F46]">
            <Banknote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">Comptage de Caisse & Billets</h3>
            <p className="text-[10px] text-slate-400">Coupures et monnaie FCFA</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="Remise à zéro"
            aria-label="Réinitialiser"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Denominations List */}
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {FCFA_DENOMINATIONS.map((d, index) => {
          const key = `${d.value}_${d.type}_${index}`;
          const qty = quantities[key] || 0;
          const lineTotal = d.value * qty;

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#ECE5D7] transition text-xs"
            >
              <div className="flex items-center gap-1.5 w-28 shrink-0">
                {d.type === 'note' ? (
                  <Banknote className="w-3.5 h-3.5 text-[#123F46]" />
                ) : (
                  <Coins className="w-3.5 h-3.5 text-[#F2C14E]" />
                )}
                <span className="font-mono font-bold text-slate-800 text-[11px]">{d.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">×</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={qty === 0 ? '' : qty}
                  onChange={(e) => handleQtyChange(key, e.target.value)}
                  className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs bg-white border border-[#ECE5D7] rounded-lg focus:outline-none focus:border-[#123F46] focus:ring-1 focus:ring-[#123F46]"
                />
              </div>

              <div className="font-mono font-bold text-right min-w-[80px] text-[11px] text-slate-900">
                {formatFCFA(lineTotal, currency)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-3 pt-3 border-t border-[#ECE5D7] space-y-2">
        <div className="flex justify-between items-center text-[10px] text-slate-500">
          <span>{totalNotesCount} billet(s) • {totalCoinsCount} pièce(s)</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[#123F46] hover:underline font-semibold cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copier le total</span>
              </>
            )}
          </button>
        </div>

        <div className="p-2.5 rounded-xl bg-[#123F46] text-white flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-200">Total Espèces</span>
          <span className="text-base font-black font-mono tracking-tight text-[#F2C14E]">
            {formatFCFA(totalAmount, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
