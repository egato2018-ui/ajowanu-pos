import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'F2', desc: 'Accéder directement à la caisse (POS / Vente)' },
    { key: 'Ctrl + K', desc: 'Ouvrir la recherche globale instantanée' },
    { key: 'F11', desc: 'Activer / Quitter le mode plein écran' },
    { key: 'Esc', desc: 'Fermer les modales, calculatrice et popovers' },
    { key: 'Ctrl + P', desc: 'Imprimer le ticket ou la facture courante' },
    { key: 'Tab', desc: 'Naviguer rapidement entre les champs de saisie' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#ECE5D7] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE5D7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#E2D9C8] flex items-center justify-center text-[#123F46]">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Raccourcis Clavier Caisse</h3>
              <p className="text-[11px] text-slate-500">Gagnez du temps au comptoir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map(s => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE5D7] text-xs"
            >
              <span className="text-slate-700 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 bg-white rounded-lg text-[11px] font-mono font-bold text-slate-800 border border-[#ECE5D7] shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#123F46] hover:bg-[#0D2F34] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};
